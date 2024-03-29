/*
 * Copyright © 2022 Lisk Foundation
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
import {
	BaseModule,
	TokenMethod,
	ValidatorsMethod,
	PoSMethod,
	codec,
	GenesisBlockExecuteContext,
	validator as liskValidator,
	utils,
	ModuleMetadata,
} from 'lisk-sdk';

import { LegacyMethod } from './method';
import { LegacyEndpoint } from './endpoint';
import {
	LEGACY_ACCOUNT_LENGTH,
	LEGACY_ACC_MAX_TOTAL_BAL_NON_INC,
	ADDRESS_LEGACY_RESERVE,
	defaultConfig,
} from './constants';
import {
	legacyAccountRequestSchema,
	genesisStoreSchema,
	legacyAccountResponseSchema,
} from './schemas';

import { ModuleConfig, ModuleConfigJSON, ModuleInitArgs, genesisLegacyStore } from './types';
import { getModuleConfig } from './utils';
import { LegacyAccountStore } from './stores/legacyAccount';
import { ReclaimLSKCommand } from './commands/reclaim';
import { RegisterKeysCommand } from './commands/register_keys';
import { AccountReclaimedEvent } from './events/accountReclaimed';
import { KeysRegisteredEvent } from './events/keysRegistered';

// eslint-disable-next-line prefer-destructuring
const validator: liskValidator.LiskValidator = liskValidator.validator;

export class LegacyModule extends BaseModule {
	public endpoint = new LegacyEndpoint(this.stores, this.offchainStores);
	public method = new LegacyMethod(this.stores, this.events);
	public legacyReserveAddress = ADDRESS_LEGACY_RESERVE;
	private _tokenMethod!: TokenMethod;
	private _validatorsMethod!: ValidatorsMethod;
	private _posMethod!: PoSMethod;
	private _moduleConfig!: ModuleConfig;

	private readonly _reclaimLSKCommand = new ReclaimLSKCommand(this.stores, this.events);
	private readonly _registerKeysCommand = new RegisterKeysCommand(this.stores, this.events);

	public constructor() {
		super();

		// Register stores
		this.stores.register(LegacyAccountStore, new LegacyAccountStore(this.name, 0));

		// Register events
		this.events.register(AccountReclaimedEvent, new AccountReclaimedEvent(this.name));
		this.events.register(KeysRegisteredEvent, new KeysRegisteredEvent(this.name));
	}

	// eslint-disable-next-line @typescript-eslint/member-ordering
	public commands = [this._reclaimLSKCommand, this._registerKeysCommand];

	public addDependencies(
		tokenMethod: TokenMethod,
		validatorsMethod: ValidatorsMethod,
		posMethod: PoSMethod,
	) {
		this._posMethod = posMethod;
		this._tokenMethod = tokenMethod;
		this._validatorsMethod = validatorsMethod;
		this._reclaimLSKCommand.addDependencies(this._tokenMethod);
		this._registerKeysCommand.addDependencies(this._validatorsMethod, this._posMethod);
	}

	public metadata(): ModuleMetadata {
		return {
			endpoints: [
				{
					name: this.endpoint.getLegacyAccount.name,
					request: legacyAccountRequestSchema,
					response: legacyAccountResponseSchema,
				},
			],
			commands: this.commands.map(command => ({
				name: command.name,
				params: command.schema,
			})),
			events: this.events.values().map(e => ({
				name: e.name,
				data: e.schema,
			})),
			assets: [
				{
					version: 0,
					data: genesisStoreSchema,
				},
			],
			stores: [],
		};
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async init(args: ModuleInitArgs) {
		const { genesisConfig, moduleConfig } = args;
		const mergedModuleConfig = utils.objects.mergeDeep(
			{},
			defaultConfig,
			moduleConfig,
		) as ModuleConfigJSON;
		this._moduleConfig = getModuleConfig(genesisConfig, mergedModuleConfig);
		this._reclaimLSKCommand.init({
			tokenIDReclaim: this._moduleConfig.tokenIDReclaim,
			moduleName: this.name,
		});
	}

	public async initGenesisState(ctx: GenesisBlockExecuteContext): Promise<void> {
		const legacyAssetsBuffer = ctx.assets.getAsset(this.name);

		if (!legacyAssetsBuffer) {
			return;
		}

		const { accounts } = codec.decode<genesisLegacyStore>(genesisStoreSchema, legacyAssetsBuffer);

		validator.validate(genesisStoreSchema, { accounts });
		const uniqueLegacyAccounts = new Set();
		let totalBalance = BigInt('0');

		for (const account of accounts) {
			if (account.address.length !== LEGACY_ACCOUNT_LENGTH)
				throw new Error(
					`legacy address length is invalid, expected ${LEGACY_ACCOUNT_LENGTH}, actual ${account.address.length}`,
				);

			uniqueLegacyAccounts.add(account.address.toString('hex'));
			totalBalance += account.balance;
		}

		if (uniqueLegacyAccounts.size !== accounts.length) {
			throw new Error('Legacy address entries are not pair-wise distinct');
		}

		if (totalBalance >= LEGACY_ACC_MAX_TOTAL_BAL_NON_INC) {
			throw new Error('Total balance for all legacy accounts cannot exceed 2^64');
		}

		const lockedAmount = await this._tokenMethod.getLockedAmount(
			ctx.getMethodContext(),
			this.legacyReserveAddress,
			this._moduleConfig.tokenIDReclaim,
			this.name,
		);

		if (totalBalance !== lockedAmount) {
			throw new Error('Total balance for all legacy accounts is not equal to locked amount');
		}

		const legacyStore = this.stores.get(LegacyAccountStore);
		await Promise.all(
			accounts.map(async account =>
				legacyStore.set(ctx, account.address, { balance: account.balance }),
			),
		);
	}
}
