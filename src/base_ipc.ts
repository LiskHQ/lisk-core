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
 *
 */

import { Command, flags as flagParser } from '@oclif/command';
import { RegisteredSchema, apiClient, codec, Transaction, cryptography } from 'lisk-sdk';
import { getDefaultPath } from './utils/path';
import { flags as commonFlags } from './utils/flags';
import { getApplication } from './application';
import { DEFAULT_NETWORK } from './constants';
import { PromiseResolvedType } from './types';
import { isApplicationRunning } from './utils/application';

interface BaseIPCFlags {
	readonly 'data-path'?: string;
	readonly network: string;
	readonly offline?: boolean;
	readonly pretty?: boolean;
}

export interface Schema {
	readonly $id: string;
	readonly type: string;
	readonly properties: Record<string, unknown>;
}

export interface Codec {
	decodeAccount: (data: Buffer | string) => Record<string, unknown>;
	decodeBlock: (data: Buffer | string) => Record<string, unknown>;
	decodeTransaction: (data: Buffer | string) => Record<string, unknown>;
	encodeTransaction: (assetSchema: Schema, transactionObject: Record<string, unknown>) => string;
	transactionFromJSON: (
		assetSchema: Schema,
		transactionObject: Record<string, unknown>,
	) => Record<string, unknown>;
	transactionToJSON: (
		assetSchema: Schema,
		transactionObject: Record<string, unknown>,
	) => Record<string, unknown>;
}

const prettyDescription = 'Prints JSON in pretty format rather than condensed.';

export default abstract class BaseIPCCommand extends Command {
	static flags = {
		pretty: flagParser.boolean({
			description: prettyDescription,
		}),
		'data-path': flagParser.string({
			...commonFlags.dataPath,
			env: 'LISK_DATA_PATH',
		}),
		offline: flagParser.boolean({
			...commonFlags.offline,
			default: false,
			hidden: true,
		}),
		network: flagParser.string({
			...commonFlags.network,
			env: 'LISK_NETWORK',
			default: DEFAULT_NETWORK,
			hidden: true,
		}),
	};

	public baseIPCFlags!: BaseIPCFlags;
	protected _client: PromiseResolvedType<ReturnType<typeof apiClient.createIPCClient>> | undefined;
	protected _schema!: RegisteredSchema;
	protected _dataPath!: string;

	// eslint-disable-next-line @typescript-eslint/require-await
	async finally(error?: Error | string): Promise<void> {
		if (error) {
			if (!isApplicationRunning(this._dataPath)) {
				throw new Error(`Application at data path ${this._dataPath} is not running.`);
			}
			this.error(error instanceof Error ? error.message : error);
		}
		if (this._client) {
			await this._client.disconnect();
		}
	}

	async init(): Promise<void> {
		const { flags } = this.parse(this.constructor as typeof BaseIPCCommand);
		this.baseIPCFlags = flags;
		this._dataPath = this.baseIPCFlags['data-path']
			? this.baseIPCFlags['data-path']
			: getDefaultPath();

		if (this.baseIPCFlags.offline) {
			// As we just need module schema, which have no dependency on genesis block
			// and configuration. So passing empty objects.
			const app = getApplication(
				{},
				{
					enableFaucetPlugin: false,
					enableForgerPlugin: false,
					enableMonitorPlugin: false,
					enableReportMisbehaviorPlugin: false,
				},
			);
			this._schema = app.getSchema();
			return;
		}

		if (!isApplicationRunning(this._dataPath)) {
			throw new Error(`Application at data path ${this._dataPath} is not running.`);
		}
		this._client = await apiClient.createIPCClient(this._dataPath);
		this._schema = this._client.schemas;
	}

	printJSON(message?: unknown): void {
		if (this.baseIPCFlags.pretty) {
			this.log(JSON.stringify(message, undefined, '  '));
		} else {
			this.log(JSON.stringify(message));
		}
	}

	protected getCommandSchema(moduleID: number, commandID: number): RegisteredSchema['commands'][0] {
		const commandSchema = this._schema.commands.find(
			schema => schema.moduleID === moduleID && schema.commandID === commandID,
		);
		if (!commandSchema) {
			throw new Error(
				`Transaction moduleID:${moduleID} with commandID:${commandID} is not registered in the application.`,
			);
		}
		return commandSchema;
	}

	protected decodeTransaction(transactionHexStr: string): Record<string, unknown> {
		const transactionBytes = Buffer.from(transactionHexStr, 'hex');
		if (this._client) {
			return this._client.transaction.decode(transactionBytes);
		}
		const id = cryptography.hash(transactionBytes);
		const transaction = codec.decode<Transaction>(this._schema.transaction, transactionBytes);
		const commandSchema = this.getCommandSchema(transaction.moduleID, transaction.commandID);
		const params = codec.decode<Record<string, unknown>>(
			commandSchema.schema as Schema,
			transaction.params,
		);
		return {
			...transaction,
			params,
			id,
		};
	}

	protected encodeTransaction(transaction: Record<string, unknown>): Buffer {
		if (this._client) {
			return this._client.transaction.encode(transaction);
		}
		const commandSchema = this.getCommandSchema(
			transaction.moduleID as number,
			transaction.commandID as number,
		);
		// eslint-disable-next-line @typescript-eslint/ban-types
		const paramBytes = codec.encode(commandSchema.schema as Schema, transaction.params as object);
		const txBytes = codec.encode(this._schema.transaction, { ...transaction, params: paramBytes });
		return txBytes;
	}

	protected transactionToJSON(transaction: Record<string, unknown>): Record<string, unknown> {
		if (this._client) {
			return this._client.transaction.toJSON(transaction);
		}
		const commandSchema = this.getCommandSchema(
			transaction.moduleID as number,
			transaction.commandID as number,
		);
		// eslint-disable-next-line @typescript-eslint/ban-types
		const paramsJSON = codec.toJSON(commandSchema.schema as Schema, transaction.params as object);
		const { id, asset, ...txWithoutAsset } = transaction;
		const txJSON = codec.toJSON(this._schema.transaction, txWithoutAsset);
		return {
			...txJSON,
			params: paramsJSON,
			id: Buffer.isBuffer(id) ? id.toString('hex') : undefined,
		};
	}
}
