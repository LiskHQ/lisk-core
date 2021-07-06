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

import { AfterGenesisBlockApplyContext, GenesisConfig, codec, testing } from 'lisk-sdk';
import { LegacyAccountModule, getLegacyBytes } from '../../../../src/application/modules';
import { createAccount, createFakeDefaultAccount } from '../../../utils/account';
import { unregisteredAddressesSchema } from '../../../../src/application/modules/legacy_account/schema';
import { CHAIN_STATE_UNREGISTERED_ADDRESSES } from '../../../../src/application/modules/legacy_account/constants';

describe('LegacyAccountModule', () => {
	let defaultAccount1;
	let defaultAccount2;
	let defaultAccount3;
	let legacyAccountModule: LegacyAccountModule;
	let afterGenesisBlockApplyInput: AfterGenesisBlockApplyContext;
	let legacyAccount1;
	let legacyAccount2;
	let newAccount;
	const legacyBalance = BigInt(100000000000);

	beforeEach(() => {
		[defaultAccount1, defaultAccount2, defaultAccount3] = [
			createAccount(),
			createAccount(),
			createAccount(),
		];
		legacyAccount1 = createFakeDefaultAccount(defaultAccount1);
		legacyAccount2 = createFakeDefaultAccount(defaultAccount2);
		newAccount = createFakeDefaultAccount(defaultAccount3);
		// assign legacy address
		legacyAccount1.address = getLegacyBytes(defaultAccount1.publicKey);
		legacyAccount2.address = getLegacyBytes(defaultAccount2.publicKey);

		const genesisBlock = {
			header: {
				asset: {
					accounts: [legacyAccount1, legacyAccount2, newAccount],
				},
			},
		};

		legacyAccountModule = new LegacyAccountModule({} as GenesisConfig);

		afterGenesisBlockApplyInput = {
			genesisBlock,
			reducerHandler: {
				invoke: jest.fn().mockResolvedValue(legacyBalance),
			},
			stateStore: new testing.mocks.StateStoreMock({
				accounts: [legacyAccount1, legacyAccount2, newAccount],
			}),
		} as any;
	});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(legacyAccountModule.id).toBe(1000);
		});

		it('should have valid name', () => {
			expect(legacyAccountModule.name).toBe('legacyAccount');
		});
	});

	describe('afterGenesisBlockApply', () => {
		it('should invoke token:getBalance for each account', async () => {
			await legacyAccountModule.afterGenesisBlockApply(afterGenesisBlockApplyInput);

			const oldAddress1 = getLegacyBytes(defaultAccount1.publicKey);
			const oldAddress2 = getLegacyBytes(defaultAccount2.publicKey);
			expect(afterGenesisBlockApplyInput.reducerHandler.invoke).toHaveBeenCalledTimes(2);
			expect(afterGenesisBlockApplyInput.reducerHandler.invoke).toHaveBeenCalledWith(
				'token:getBalance',
				{
					address: oldAddress1,
				},
			);
			expect(afterGenesisBlockApplyInput.reducerHandler.invoke).toHaveBeenCalledWith(
				'token:getBalance',
				{
					address: oldAddress2,
				},
			);
		});

		it('should save unregistered accounts to state store', async () => {
			await legacyAccountModule.afterGenesisBlockApply(afterGenesisBlockApplyInput);

			const encodedUnregisteredAddresses = codec.encode(unregisteredAddressesSchema, {
				unregisteredAddresses: [
					{
						address: getLegacyBytes(defaultAccount1.publicKey),
						balance: legacyBalance,
					},
					{
						address: getLegacyBytes(defaultAccount2.publicKey),
						balance: legacyBalance,
					},
				],
			});

			const savedResult = await afterGenesisBlockApplyInput.stateStore.chain.get(
				CHAIN_STATE_UNREGISTERED_ADDRESSES,
			);
			expect(encodedUnregisteredAddresses).toEqual(savedResult);
		});

		it('should delete unregistered accounts from state store', async () => {
			await legacyAccountModule.afterGenesisBlockApply(afterGenesisBlockApplyInput);
			await expect(
				afterGenesisBlockApplyInput.stateStore.account.get(legacyAccount1.address),
			).rejects.toThrow('Account not defined');
			await expect(
				afterGenesisBlockApplyInput.stateStore.account.get(legacyAccount2.address),
			).rejects.toThrow('Account not defined');
		});
	});

	describe('getUnregisteredAccount', () => {
		const dataAccessMock = {
			getChainState: jest.fn(),
		};
		const unregisteredAccount = createAccount();
		unregisteredAccount.address = getLegacyBytes(unregisteredAccount.publicKey);

		const unregisteredAddressWithBalance = {
			address: unregisteredAccount.address,
			balance: BigInt(200000000000),
		};

		const encodedUnregisteredAddresses = codec.encode(unregisteredAddressesSchema, {
			unregisteredAddresses: [unregisteredAddressWithBalance],
		});

		beforeEach(() => {
			(legacyAccountModule as any)['_dataAccess'] = dataAccessMock;
			dataAccessMock.getChainState.mockResolvedValue(encodedUnregisteredAddresses);
		});

		it('should return the unregistered address', async () => {
			// Act
			const legacyAccount = await legacyAccountModule.actions.getUnregisteredAccount({
				publicKey: unregisteredAccount.publicKey.toString('hex'),
			});

			// Assert
			expect(legacyAccount).toEqual({
				address: unregisteredAddressWithBalance.address.toString('hex'),
				balance: unregisteredAddressWithBalance.balance.toString(),
			});
		});

		it('should return undefined when not found in unregisteredAddresses list', async () => {
			// Arrange
			const randomAccount = createAccount();

			// Act
			const legacyAccount = (await legacyAccountModule.actions.getUnregisteredAccount({
				publicKey: randomAccount.publicKey.toString('hex'),
			})) as { address: string; balance: string };

			// Assert
			return expect(legacyAccount).toBeUndefined();
		});

		it('should throw an error when publicKey is not provided', async () => {
			// Assert
			await expect(legacyAccountModule.actions.getUnregisteredAccount({})).rejects.toThrow(
				'Public key is either not provided or not a string',
			);
		});

		it('should throw an error when publicKey is not a string', async () => {
			// Assert
			await expect(
				legacyAccountModule.actions.getUnregisteredAccount({ publicKey: Buffer.from('') }),
			).rejects.toThrow('Public key is either not provided or not a string');
		});
	});
});
