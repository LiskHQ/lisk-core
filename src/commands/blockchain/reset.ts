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
import { getDefaultPath } from '../../utils/path';
import { getPid, isApplicationRunning } from '../../utils/application';
import { getBlockchainDB } from '../../utils/db';
import * as inquirer from 'inquirer';

export default class ResetCommand extends Command {
	static description = 'Resets the blockchain data.';

	static examples = [
		'blockchain:reset',
		'blockchain:reset --data-path ./lisk',
		'blockchain:reset --yes',
	];

	static flags = {
		'data-path': flagParser.string({
			char: 'd',
			description:
				'Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH" can also be used.',
			env: 'LISK_DATA_PATH',
		}),
		yes: flagParser.boolean({
			char: 'y',
			description: 'Skip confirmation prompt.',
		}),
	};

	async run(): Promise<void> {
		const { flags } = this.parse(ResetCommand);
		const dataPath = flags['data-path'] ? flags['data-path'] : getDefaultPath();
		const skipPrompt = flags['yes'] ?? false;

		if (isApplicationRunning(dataPath)) {
			const errorMessage = `Can't clear db while running application. Application at data path ${dataPath} is running with pid ${getPid(
				dataPath,
			)}.`;

			this.error(errorMessage);
		}

		if (!skipPrompt) {
			const { answer } = await inquirer.prompt([
				{
					name: 'answer',
					message: 'Are you sure you want to clear the db?',
					type: 'list',
					choices: ['yes', 'no'],
				},
			]);

			if (answer == 'no') {
				return;
			}
		}

		const db = getBlockchainDB(dataPath);
		db.clear();
		this.log('Blockchain data has been cleared from db.');
	}
}