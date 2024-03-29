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
	BaseCommand,
	ValidatorsMethod,
	PoSMethod,
	CommandExecuteContext,
	CommandVerifyContext,
	VerificationResult,
	VerifyStatus,
	validator as liskValidator,
	cryptography,
} from 'lisk-sdk';
import { INVALID_BLS_KEY } from '../constants';
import { registerKeysParamsSchema } from '../schemas';
import { registerKeysData } from '../types';
import { KeysRegisteredEvent } from '../events/keysRegistered';

const {
	address: { getAddressFromPublicKey },
} = cryptography;

// eslint-disable-next-line prefer-destructuring
const validator: liskValidator.LiskValidator = liskValidator.validator;

export class RegisterKeysCommand extends BaseCommand {
	public schema = registerKeysParamsSchema;
	private readonly invalidBlsKey = INVALID_BLS_KEY;
	private _validatorsMethod!: ValidatorsMethod;
	private _posMethod!: PoSMethod;

	public addDependencies(validatorsMethod: ValidatorsMethod, posMethod: PoSMethod) {
		this._validatorsMethod = validatorsMethod;
		this._posMethod = posMethod;
	}

	public async verify(ctx: CommandVerifyContext): Promise<VerificationResult> {
		const params = (ctx.params as unknown) as registerKeysData;

		try {
			validator.validate(registerKeysParamsSchema, params);
		} catch (err) {
			return {
				status: VerifyStatus.FAIL,
				error: err as Error,
			};
		}

		const validatorAddress = getAddressFromPublicKey(ctx.transaction.senderPublicKey);
		const validatorKeys = await this._validatorsMethod.getValidatorKeys(
			ctx.getMethodContext(),
			validatorAddress,
		);

		if (Buffer.compare(validatorKeys.blsKey, this.invalidBlsKey) !== 0) {
			return {
				status: VerifyStatus.FAIL,
				error: new Error('Validator already has a registered BLS key.'),
			};
		}

		return { status: VerifyStatus.OK };
	}

	public async execute(ctx: CommandExecuteContext): Promise<void> {
		const params = (ctx.params as unknown) as registerKeysData;
		const validatorAddress = getAddressFromPublicKey(ctx.transaction.senderPublicKey);

		await this._validatorsMethod.setValidatorGeneratorKey(
			ctx.getMethodContext(),
			validatorAddress,
			params.generatorKey,
		);

		await this._validatorsMethod.setValidatorBLSKey(
			ctx.getMethodContext(),
			validatorAddress,
			params.blsKey,
			params.proofOfPossession,
		);

		const keysRegisteredEvent = this.events.get(KeysRegisteredEvent);
		keysRegisteredEvent.log(ctx.getMethodContext(), {
			address: validatorAddress,
			generatorKey: params.generatorKey,
			blsKey: params.blsKey,
		});

		await this._posMethod.unbanValidator(ctx.getMethodContext(), validatorAddress);
	}
}
