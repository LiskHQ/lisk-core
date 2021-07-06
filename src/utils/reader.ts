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

import { passphrase as liskPassphrase } from 'lisk-sdk';
import * as inquirer from 'inquirer';

import { ValidationError } from './error';
import { Schema } from '../base_ipc';

interface MnemonicError {
	readonly code: string;
	readonly message: string;
}

interface PropertyValue {
	readonly dataType: string;
	readonly type: string;
	readonly items: { type: string; properties: Record<string, unknown> };
}

interface Question {
	readonly [key: string]: unknown;
}

const capitalise = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

const getPromptVerificationFailError = (displayName: string): string =>
	`${capitalise(displayName)} was not successfully repeated.`;

export const getPasswordFromPrompt = async (
	displayName = 'password',
	shouldConfirm = false,
): Promise<string> => {
	const questions = [
		{
			type: 'password',
			name: 'password',
			message: `Please enter ${displayName}: `,
		},
	];
	if (shouldConfirm) {
		questions.push({
			type: 'password',
			name: 'passwordRepeat',
			message: `Please re-enter ${displayName}: `,
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
	const { password, passwordRepeat } = await inquirer.prompt(questions);
	if (!password || (shouldConfirm && password !== passwordRepeat)) {
		throw new ValidationError(getPromptVerificationFailError(displayName));
	}

	return password as string;
};

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

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
	const { passphrase, passphraseRepeat } = await inquirer.prompt(questions);

	if (!passphrase || (shouldConfirm && passphrase !== passphraseRepeat)) {
		throw new ValidationError(getPromptVerificationFailError(displayName));
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

interface NestedPropertyTemplate {
	[key: string]: string[];
}

interface NestedAsset {
	[key: string]: Array<Record<string, string>>;
}

const getNestedPropertyTemplate = (schema: Schema): NestedPropertyTemplate => {
	const keyValEntries = Object.entries(schema.properties);
	const template: NestedPropertyTemplate = {};

	// eslint-disable-next-line @typescript-eslint/prefer-for-of
	for (let i = 0; i < keyValEntries.length; i += 1) {
		const [schemaPropertyName, schemaPropertyValue] = keyValEntries[i];
		if ((schemaPropertyValue as PropertyValue).type === 'array') {
			// nested items properties
			if ((schemaPropertyValue as PropertyValue).items.type === 'object') {
				template[schemaPropertyName] = Object.keys(
					(schemaPropertyValue as PropertyValue).items.properties,
				);
			}
		}
	}
	return template;
};

const castValue = (
	strVal: string,
	schemaType: string,
): number | string | Record<string, unknown> => {
	if (schemaType === 'object') {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return JSON.parse(strVal);
	}
	return Number.isInteger(Number(strVal)) ? Number(strVal) : strVal;
};

export const transformAsset = (
	schema: Schema,
	data: Record<string, string>,
): Record<string, string> => {
	const propertySchema = Object.values(schema.properties);

	return Object.entries(data).reduce((acc, curr, index) => {
		const schemaType = (propertySchema[index] as { type: string }).type;
		acc[curr[0]] = schemaType === 'array' ? curr[1].split(',') : castValue(curr[1], schemaType);
		return acc;
	}, {});
};

export const transformNestedAsset = (
	schema: Schema,
	data: Array<Record<string, string>>,
): NestedAsset => {
	const template = getNestedPropertyTemplate(schema);
	const result = {};
	const items: Array<Record<string, string>> = [];
	for (const assetData of data) {
		const [[key, val]] = Object.entries(assetData);
		const templateValues = template[key];
		const valObject = val.split(',').reduce((acc, curr, index) => {
			acc[templateValues[index]] = Number.isInteger(Number(curr)) ? Number(curr) : curr;
			return acc;
		}, {});
		items.push(valObject);
		result[key] = items;
	}
	return result;
};

export const prepareQuestions = (schema: Schema): Question[] => {
	const keyValEntries = Object.entries(schema.properties);
	const questions: Question[] = [];

	for (const [schemaPropertyName, schemaPropertyValue] of keyValEntries) {
		if ((schemaPropertyValue as PropertyValue).type === 'array') {
			let commaSeparatedKeys: string[] = [];
			// nested items properties
			if ((schemaPropertyValue as PropertyValue).items.type === 'object') {
				commaSeparatedKeys = Object.keys((schemaPropertyValue as PropertyValue).items.properties);
			}
			questions.push({
				type: 'input',
				name: schemaPropertyName,
				message: `Please enter: ${schemaPropertyName}(${
					commaSeparatedKeys.length ? commaSeparatedKeys.join(', ') : 'comma separated values (a,b)'
				}): `,
			});
			if ((schemaPropertyValue as PropertyValue).items.type === 'object') {
				questions.push({
					type: 'confirm',
					name: 'askAgain',
					message: `Want to enter another ${schemaPropertyName}(${commaSeparatedKeys.join(', ')})`,
				});
			}
		} else {
			questions.push({
				type: 'input',
				name: schemaPropertyName,
				message: `Please enter: ${schemaPropertyName}: `,
			});
		}
	}
	return questions;
};

export const getAssetFromPrompt = async (
	assetSchema: Schema,
	output: Array<{ [key: string]: string }> = [],
): Promise<NestedAsset | Record<string, unknown>> => {
	// prepare array of questions based on asset schema
	const questions = prepareQuestions(assetSchema);
	let isTypeConfirm = false;
	// Prompt user with prepared questions
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
	const result = await inquirer.prompt(questions).then(async (answer: { [x: string]: string }) => {
		isTypeConfirm = typeof answer.askAgain === 'boolean';
		// if its a multiple questions prompt user again
		if (answer.askAgain) {
			output.push(answer);
			return getAssetFromPrompt(assetSchema, output);
		}
		output.push(answer);
		return Promise.resolve(answer);
	});
	const filteredResult = output.map(({ askAgain, ...assetProps }) => assetProps);

	// transform asset prompt result according to asset schema
	return isTypeConfirm
		? transformNestedAsset(assetSchema, filteredResult)
		: transformAsset(assetSchema, result);
};
