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

export default class DisableForgingCommand extends BaseIPCCommand {
	static description = 'Disable forging for given delegate address.';

	static examples = [
		'forging:disable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815',
		'forging:disable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 --data-path ./data',
		'forging:disable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 --data-path ./data --password your_password',
	];

	static args = [
		{
			name: 'address',
			required: true,
			description: 'Address of an account in a base32 format.',
		},
	];

	static flags = {
		...BaseIPCCommand.flags,
		password: flagParser.string(commonFlags.password),
	};

	async run(): Promise<void> {
		const { args, flags } = this.parse(this.constructor as typeof DisableForgingCommand);
		const { address } = args as { readonly address: string };
		let password: string;

		if (!this._client) {
			this.error('APIClient is not initialized.');
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
				forging: false,
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
