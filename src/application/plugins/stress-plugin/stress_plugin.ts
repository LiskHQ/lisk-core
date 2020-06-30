/*
 * Copyright © 2020 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */
/* eslint-disable */
import {
	BasePlugin,
	PluginInfo,
	EventsArray,
	ActionsDefinition,
	BaseChannel,
	cryptography,
	transactions,
	codec,
	utils,
	Transaction,
	passphrase as liskPassphrase,
} from 'lisk-sdk';
import * as config from './defaults';

const { Mnemonic } = liskPassphrase;

const transferAsset = {
	$id: 'lisk/transfer-asset',
	title: 'Transfer transaction asset',
	type: 'object',
	required: ['amount', 'recipientAddress', 'data'],
	properties: {
		amount: {
			dataType: 'uint64',
			fieldNumber: 1,
		},
		recipientAddress: {
			dataType: 'bytes',
			fieldNumber: 2,
			minLength: 20,
			maxLength: 20,
		},
		data: {
			dataType: 'string',
			fieldNumber: 3,
			minLength: 0,
			maxLength: 64,
		},
	},
};

export class StressPlugin extends BasePlugin {
	private _scheduler!: utils.jobHandlers.Scheduler<void>;
	private _channel!: BaseChannel;
	private _config!: { passphrase: string };

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public static get alias(): string {
		return 'stress';
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public static get info(): PluginInfo {
		return {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			author: '@liskhq',
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			version: '0.1.0',
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			name: 'stress_plugin',
		};
	}

	// eslint-disable-next-line class-methods-use-this
	public get defaults(): object {
		return config.defaultConfig;
	}

	// eslint-disable-next-line class-methods-use-this
	public get events(): EventsArray {
		return [];
	}

	// eslint-disable-next-line class-methods-use-this
	public get actions(): ActionsDefinition {
		return {};
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async load(channel: BaseChannel): Promise<void> {
		this._channel = channel;
		const options = utils.objects.mergeDeep(
			{},
			config.defaultConfig.default,
			this.options,
		) as { passphrase: string };
		this._config = options;
		this._channel.once('app:block:new', async () => {
			await this._sendFunds();
			this._scheduler = new utils.jobHandlers.Scheduler(async () => {
				await this._sendFunds();
			}, 1000 * 60 * 15);
			this._scheduler.start();
		});

	}

	private async _sendFunds(): Promise<void> {
		const { publicKey, address } = cryptography.getAddressAndPublicKeyFromPassphrase(this._config.passphrase);
		const encodedAccount = await this._channel.invoke<string>('app:getAccount', { address: address.toString('hex') });
		const account = this.codec.decodeAccount<{sequence: { nonce: string }}>(encodedAccount);
		const nonce = BigInt(account.sequence.nonce);
		const networkIdentifier = cryptography.getNetworkIdentifier(Buffer.from('629cefa068f2eb44baf4f81301a5e98c23c41fd8c76b738847d4459754c078ff', 'hex'), 'Lisk');
		const recipients: string[] = [];
		for (let i = nonce; i < nonce + BigInt(64); i += BigInt(1)) {
			const passphrase = Mnemonic.generateMnemonic();
			recipients.push(passphrase);
			const { address } = cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);
			const signedTransaction = transactions.signTransaction(transferAsset, {
				moduleID: 2,
				assetID: 0,
				senderPublicKey: publicKey,
				nonce: BigInt(i),
				fee: BigInt(10000000),
				asset: {
					recipientAddress: address,
					amount: BigInt(10000000000),
					data: '',
				},
			}, networkIdentifier, this._config.passphrase);
			const assetBuffer = codec.encode(transferAsset, signedTransaction.asset as object);
			const tx = new Transaction({
				...signedTransaction,
				asset: assetBuffer,
			} as any);
			try {
				await this._channel.invoke('app:postTransaction', { transaction: tx.getBytes().toString('hex') });
			} catch (error) {
				console.error(`Failed to send transaction ${tx.id.toString('hex')}`);
			}
		}
		await new Promise(resolve => setTimeout(resolve, 1000 * 60));
		for (const recipientPassphrase of recipients) {
			for (let i = 0; i < 64; i += 1) {
				// sender
				const { publicKey } = cryptography.getAddressAndPublicKeyFromPassphrase(recipientPassphrase);
				// recipient
				const passphrase = Mnemonic.generateMnemonic();
				const { address } = cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);
				const signedTransaction = transactions.signTransaction(transferAsset, {
					moduleID: 2,
					assetID: 0,
					senderPublicKey: publicKey,
					nonce: BigInt(i),
					fee: BigInt(10000000),
					asset: {
						recipientAddress: address,
						amount: BigInt(10000000),
						data: '',
					},
				}, networkIdentifier, recipientPassphrase);
				const assetBuffer = codec.encode(transferAsset, signedTransaction.asset as object);
				const tx = new Transaction({
					...signedTransaction,
					asset: assetBuffer,
				} as any);
				try {
					await this._channel.invoke('app:postTransaction', { transaction: tx.getBytes().toString('hex') });
				} catch (error) {
					console.error(`Failed to send transaction ${tx.id.toString('hex')}`);
				}
			}
		}
	}

	public async unload(): Promise<void> {
		await this._scheduler.stop();
	}
}
