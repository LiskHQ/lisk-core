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

import { flags as flagParser } from '@oclif/command';
import * as inquirer from 'inquirer';

import BaseIPCCommand from '../../base_ipc';
import { flags as commonFlags } from '../../utils/flags';

interface Args {
	readonly address: string;
	readonly height?: number;
	readonly maxHeightPreviouslyForged?: number;
	readonly maxHeightPrevoted?: number;
}

const isLessThanZero = (value: number): boolean => !Number.isNaN(value) && value < 0;

const isZeroAndAbove = (value: number): boolean => !Number.isNaN(value) && value >= 0;

export default class EnableForgingCommand extends BaseIPCCommand {
	static description = 'Enable forging for given delegate address.';

	static examples = [
		'forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 --use-status-values',
		'forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 --use-status-values --yes',
		'forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 100 100 10',
		'forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 100 100 10 --overwrite',
		'forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 100 100 10 --data-path ./data',
		'forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 100 100 10 --data-path ./data --password your_password',
	];

	static flags = {
		...BaseIPCCommand.flags,
		password: flagParser.string(commonFlags.password),
		overwrite: flagParser.boolean({
			description: 'Overwrites the forger info',
			default: false,
		}),
		'use-status-values': flagParser.boolean({
			description: 'Use delegates forging status values',
		}),
		yes: flagParser.boolean({
			char: 'y',
			description: 'Do you want to use these values to enable forging',
			default: false,
		}),
	};

	static args = [
		{
			name: 'address',
			required: true,
			description: 'Address of an account in a base32 format.',
		},
		{
			name: 'height',
			required: false,
			description: 'Last forged block height.',
		},
		{
			name: 'maxHeightPreviouslyForged',
			required: false,
			description: 'Delegates largest previously forged height.',
		},
		{
			name: 'maxHeightPrevoted',
			required: false,
			description: 'Delegates largest prevoted height for a block.',
		},
	];

	async run(): Promise<void> {
		const { args, flags } = this.parse(this.constructor as typeof EnableForgingCommand);
		const { address } = args as Args;
		const useStatusValue = flags['use-status-values'];
		const height = parseInt(args.height, 10);
		const maxHeightPrevoted = parseInt(args.maxHeightPrevoted, 10);
		const maxHeightPreviouslyForged = parseInt(args.maxHeightPreviouslyForged, 10);
		let password: string;

		if (!this._client) {
			this.error('APIClient is not initialized.');
		}

		if (
			useStatusValue &&
			(isZeroAndAbove(height) ||
				isZeroAndAbove(maxHeightPreviouslyForged) ||
				isZeroAndAbove(maxHeightPrevoted))
		) {
			throw new Error(
				'Flag --use-status-values can not be used along with arguments height, maxHeightPreviouslyForged, maxHeightPrevoted',
			);
		}

		if (
			!useStatusValue &&
			(isLessThanZero(height) ||
				isLessThanZero(maxHeightPreviouslyForged) ||
				isLessThanZero(maxHeightPrevoted))
		) {
			throw new Error(
				'The height, maxHeightPreviouslyForged and maxHeightPrevoted parameter value must be greater than or equal to 0',
			);
		}

		const forgingStatus = await this._client.invoke<Args[]>('app:getForgingStatus');
		const defaultForgerInfo = { height: 0, maxHeightPrevoted: 0, maxHeightPreviouslyForged: 0 };
		let forgerInfo = forgingStatus.find(f => f.address === address);

		if (useStatusValue && forgerInfo) {
			forgerInfo = { ...defaultForgerInfo, ...forgerInfo };
			// eslint-disable-next-line dot-notation
			if (!flags['yes']) {
				this.log(
					// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
					`\n Current forging status for delegate account ${address} is:`,
				);
				this.printJSON({
					height: forgerInfo.height,
					maxHeightPrevoted: forgerInfo.maxHeightPrevoted,
					maxHeightPreviouslyForged: forgerInfo.maxHeightPreviouslyForged,
				});

				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
				const { answer } = await inquirer.prompt([
					{
						name: 'answer',
						message: 'Do you want to use the above values to enable forging?',
						type: 'list',
						choices: ['yes', 'no'],
					},
				]);

				if (answer === 'no') {
					return;
				}
			}
		}

		if (flags.overwrite) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
			const { answer } = await inquirer.prompt([
				{
					name: 'answer',
					message:
						'CAUTION: Do you really want to overwrite the forging config? If you provide incorrect forging information you will be punished.',
					type: 'list',
					choices: ['yes', 'no'],
				},
			]);

			if (answer === 'no') {
				return;
			}
		}

		if (flags.password) {
			password = flags.password;
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
			const answers = await inquirer.prompt([
				{
					type: 'password',
					message: 'Enter password to decrypt the encrypted passphrase: ',
					name: 'password',
					mask: '*',
				},
			]);
			password = (answers as { password: string }).password;
		}

		try {
			const params = {
				address,
				password,
				forging: true,
				height: Number(useStatusValue ? forgerInfo?.height : height),
				maxHeightPreviouslyForged: Number(
					useStatusValue ? forgerInfo?.maxHeightPreviouslyForged : maxHeightPreviouslyForged,
				),
				maxHeightPrevoted: Number(
					useStatusValue ? forgerInfo?.maxHeightPrevoted : maxHeightPrevoted,
				),
				overwrite: flags.overwrite,
			};

			const result = await this._client.invoke<{ address: string; forging: boolean }>(
				'app:updateForgingStatus',
				params,
			);
			this.log('Updated forging status:');
			this.printJSON(result);
		} catch (error) {
			this.error(error);
		}
	}
}
