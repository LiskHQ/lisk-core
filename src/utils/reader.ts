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

import * as liskPassphrase from '@liskhq/lisk-passphrase';
import * as inquirer from 'inquirer';

import { ValidationError } from './error';

interface MnemonicError {
	readonly code: string;
	readonly message: string;
}

const capitalise = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

const getPassphraseVerificationFailError = (displayName: string): string =>
	`${capitalise(displayName)} was not successfully repeated.`;

export const getPassphraseFromPrompt = async (
	displayName = 'passphrase',
	shouldConfirm = false,
): Promise<string> => {
	const questions = [
		{
			type: 'password',
			name: 'passphrase',
			message: `Please enter ${displayName}: `,
		},
	];
	if (shouldConfirm) {
		questions.push({
			type: 'password',
			name: 'passphraseRepeat',
			message: `Please re-enter ${displayName}: `,
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const { passphrase, passphraseRepeat } = await inquirer.prompt(questions);

	if (!passphrase || (shouldConfirm && passphrase !== passphraseRepeat)) {
		throw new ValidationError(getPassphraseVerificationFailError(displayName));
	}

	const passphraseErrors = [passphrase]
		.filter(Boolean)
		.map(pass =>
			liskPassphrase.validation
				.getPassphraseValidationErrors(pass as string)
				.filter((error: MnemonicError) => error.message),
		);

	passphraseErrors.forEach(errors => {
		if (errors.length > 0) {
			const passphraseWarning = errors
				.filter((error: MnemonicError) => error.code !== 'INVALID_MNEMONIC')
				.reduce(
					(accumulator: string, error: MnemonicError) =>
						accumulator.concat(`${error.message.replace(' Please check the passphrase.', '')} `),
					'Warning: ',
				);
			console.warn(passphraseWarning);
		}
	});

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return passphrase;
};
