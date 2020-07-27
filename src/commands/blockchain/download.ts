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
import { ApplicationConfig, GenesisBlockJSON } from 'lisk-sdk';
import { NETWORK, RELEASE_URL, DEFAULT_NETWORK } from '../../constants';
import { liskSnapshotUrl } from '../../utils/commons';
import { getDefaultPath, getFullPath } from '../../utils/path';
import { downloadAndValidate } from '../../utils/download';
import * as configs from '../../config';

export default class DownloadCommand extends Command {
	static description = 'Download blockchain data from a provided snapshot.';

	static examples = [
		'download',
		'download --network betanet',
		'download --url https://downloads.lisk.io/lisk/mainnet/blockchain.db.gz --output ./downloads',
	];

	static flags = {
		network: flagParser.string({
			char: 'n',
			description:
				'Default network config to use. Environment variable "LISK_NETWORK" can also be used.',
			env: 'LISK_NETWORK',
			default: DEFAULT_NETWORK,
		}),
		output: flagParser.string({
			char: 'o',
			description:
				'Directory path to specify where snapshot is downloaded. Environment variable "LISK_DATA_PATH" can also be used.',
			env: 'LISK_DATA_PATH',
		}),
		url: flagParser.string({
			char: 'u',
			description: 'The url to the snapshot.',
		}),
	};

	async run(): Promise<void> {
		const { flags } = this.parse(DownloadCommand);
		const network = flags.network ? (flags.network as NETWORK) : DEFAULT_NETWORK;
		const url = flags.url ? flags.url : liskSnapshotUrl(RELEASE_URL, network);
		const dataPath = flags.output ? flags.output : getDefaultPath();
		this.log(`Downloading snapshot from ${url} to ${getFullPath(dataPath)}`);

		const networkConfigs = configs[flags.network] as
			| { config: ApplicationConfig; genesisBlock: GenesisBlockJSON }
			| undefined;
		if (networkConfigs === undefined) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			throw new Error(`Network must be one of ${Object.keys(configs)}.`);
		}

		try {
			await downloadAndValidate(url, dataPath);
			this.log('Download complete.');
		} catch (errors) {
			this.error(
				Array.isArray(errors) ? errors.map(err => (err as Error).message).join(',') : errors,
			);
		}
	}
}
