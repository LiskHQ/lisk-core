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

import { Actions, AfterGenesisBlockApplyContext, BaseModule, codec } from 'lisk-sdk';
import { CHAIN_STATE_UNREGISTERED_ADDRESSES } from './constants';
import { unregisteredAddressesSchema } from './schema';
import { getLegacyBytes, ReclaimAsset } from './transaction_assets/reclaim_asset';
import { UnregisteredAddresses } from './types';

export class LegacyAccountModule extends BaseModule {
	public name = 'legacyAccount';
	public id = 1000;
	public transactionAssets = [new ReclaimAsset()];

	public actions: Actions = {
		getUnregisteredAccount: async (
			params: Record<string, unknown>,
		): Promise<{ address: string; balance: string } | undefined> => {
			if (!params?.publicKey || typeof params?.publicKey !== 'string') {
				throw new Error('Public key is either not provided or not a string');
			}

			const encodedUnregisteredAddresses: Buffer | undefined = await this._dataAccess.getChainState(
				CHAIN_STATE_UNREGISTERED_ADDRESSES,
			);

			if (!encodedUnregisteredAddresses) {
				throw new Error('Chain state does not contain any unregistered addresses');
			}

			const { unregisteredAddresses } = codec.decode<UnregisteredAddresses>(
				unregisteredAddressesSchema,
				encodedUnregisteredAddresses,
			);

			const legacyAddress = getLegacyBytes(Buffer.from(params.publicKey, 'hex'));
			const addressWithoutPublickey = unregisteredAddresses.find(a =>
				a.address.equals(legacyAddress),
			);

			return addressWithoutPublickey
				? {
						address: addressWithoutPublickey.address.toString('hex'),
						balance: addressWithoutPublickey.balance.toString(),
				  }
				: undefined;
		},
	};
	// eslint-disable-next-line class-methods-use-this
	public async afterGenesisBlockApply({
		genesisBlock,
		reducerHandler,
		stateStore,
	}: AfterGenesisBlockApplyContext): Promise<void> {
		const { accounts } = genesisBlock.header.asset;
		// New address is 20-byte value specified in LIP 0018 if the account has a registered public key.
		// Otherwise, it is the 8-byte value of the legacy address.
		const unregisteredAddresses = accounts.filter(account => account.address.length !== 20);
		const unregisteredAddressesWithBalance = await Promise.all(
			unregisteredAddresses.map(async ({ address }) => {
				const balance = await reducerHandler.invoke<bigint>('token:getBalance', { address });
				return { address, balance };
			}),
		);
		const encodedUnregisteredAddresses = codec.encode(unregisteredAddressesSchema, {
			unregisteredAddresses: unregisteredAddressesWithBalance,
		});
		// Delete legacy account from account state
		for (const { address } of unregisteredAddresses) {
			await stateStore.account.del(address);
		}
		await stateStore.chain.set(CHAIN_STATE_UNREGISTERED_ADDRESSES, encodedUnregisteredAddresses);
	}
}
