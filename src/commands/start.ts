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
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Command, flags as flagParser } from '@oclif/command';
import * as fs from 'fs-extra';
import { ApplicationConfig, utils, GenesisBlockJSON, HTTPAPIPlugin, ForgerPlugin } from 'lisk-sdk';
import { getDefaultPath, splitPath, getFullPath } from '../utils/path';
import { flags as commonFlags } from '../utils/flags';
import { getApplication } from '../application';
// eslint-disable-next-line import/namespace
import * as configs from '../config';
import { DEFAULT_NETWORK } from '../constants';

const LOG_OPTIONS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

export default class StartCommand extends Command {
	static description = 'Start Lisk Core Node with given config parameters';

	static examples = ['start', 'start --network dev --data-path ./data --log debug'];

	static flags = {
		'data-path': flagParser.string({
			...commonFlags.dataPath,
			env: 'LISK_DATA_PATH',
		}),
		network: flagParser.string({
			char: 'n',
			description:
				'Default network config to use. Environment variable "LISK_NETWORK" can also be used.',
			env: 'LISK_NETWORK',
			default: DEFAULT_NETWORK,
		}),
		config: flagParser.string({
			char: 'c',
			description:
				'File path to a custom config. Environment variable "LISK_CONFIG_FILE" can also be used.',
			env: 'LISK_CONFIG_FILE',
		}),
		port: flagParser.integer({
			char: 'p',
			description:
				'Open port for the peer to peer incoming connections. Environment variable "LISK_PORT" can also be used.',
			env: 'LISK_PORT',
		}),
		'enable-ipc': flagParser.boolean({
			description: 'Enable IPC communication.',
			default: false,
		}),
		'console-log': flagParser.string({
			description:
				'Console log level. Environment variable "LISK_CONSOLE_LOG_LEVEL" can also be used.',
			env: 'LISK_CONSOLE_LOG_LEVEL',
			options: LOG_OPTIONS,
		}),
		log: flagParser.string({
			char: 'l',
			description: 'File log level. Environment variable "LISK_FILE_LOG_LEVEL" can also be used.',
			env: 'LISK_FILE_LOG_LEVEL',
			options: LOG_OPTIONS,
		}),
		peers: flagParser.string({
			env: 'LISK_PEERS',
			description:
				'Seed peers to initially connect to in format of comma separated "ip:port". IP can be DNS name or IPV4 format. Environment variable "LISK_PEERS" can also be used.',
		}),
		'enable-http-api': flagParser.boolean({
			description:
				'Enable HTTP API Plugin. Environment variable "LISK_ENABLE_HTTP_API" can also be used.',
			env: 'LISK_ENABLE_HTTP_API',
			default: false,
		}),
		'http-api-port': flagParser.integer({
			description:
				'Port to be used for HTTP API Plugin. Environment variable "LISK_HTTP_API_PORT" can also be used.',
			env: 'LISK_HTTP_API_PORT',
			dependsOn: ['enable-http-api'],
		}),
		'http-api-whitelist': flagParser.string({
			description:
				'List of IPs in comma separated value to allow the connection. Environment variable "LISK_HTTP_API_WHITELIST" can also be used.',
			env: 'LISK_HTTP_API_WHITELIST',
			dependsOn: ['enable-http-api'],
		}),
		'enable-forger': flagParser.boolean({
			description:
				'Enable Forger Plugin. Environment variable "LISK_ENABLE_FORGER" can also be used.',
			env: 'LISK_ENABLE_FORGER',
			default: false,
		}),
		'forger-port': flagParser.integer({
			description:
				'Port to be used for Forger Plugin. Environment variable "LISK_FORGER_PORT" can also be used.',
			env: 'LISK_FORGER_PORT',
			dependsOn: ['enable-forger'],
		}),
		'forger-whitelist': flagParser.string({
			description:
				'List of IPs in comma separated value to allow the connection. Environment variable "LISK_FORGER_WHITELIST" can also be used.',
			env: 'LISK_FORGER_WHITELIST',
			dependsOn: ['enable-forger'],
		}),
	};

	// eslint-disable-next-line @typescript-eslint/require-await
	async run(): Promise<void> {
		const { flags } = this.parse(StartCommand);
		const dataPath = flags['data-path'] ? flags['data-path'] : getDefaultPath();
		this.log(`Starting Lisk Core at ${getFullPath(dataPath)}`);
		const pathConfig = splitPath(dataPath);
		// Make sure data path exists

		// Copy all default configs to datapath if not exist
		// eslint-disable-next-line import/namespace
		const networkConfigs = configs[flags.network] as
			| { config: ApplicationConfig; genesisBlock: GenesisBlockJSON }
			| undefined;
		if (networkConfigs === undefined) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			throw new Error(`Network must be one of ${Object.keys(configs)}.`);
		}
		// Get config from network config or config specifeid
		let { config } = networkConfigs;
		if (flags.config) {
			const customConfig: ApplicationConfig = await fs.readJSON(flags.config);
			config = utils.objects.mergeDeep({}, config, customConfig) as ApplicationConfig;
		}

		config.rootPath = pathConfig.rootPath;
		config.label = pathConfig.label;
		config.version = this.config.pjson.version;
		// Inject other properties specified
		if (flags['enable-ipc']) {
			config.ipc = { enabled: flags['enable-ipc'] };
		}
		if (flags['console-log']) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			config.logger = config.logger ?? {};
			config.logger.consoleLogLevel = flags['console-log'];
		}
		if (flags.log) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			config.logger = config.logger ?? {};
			config.logger.fileLogLevel = flags.log;
		}
		if (flags.port) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			config.network = config.network ?? {};
			config.network.port = flags.port;
		}
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (flags.peers) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			config.network = config.network ?? {};
			config.network.seedPeers = [];
			const peers = flags.peers.split(',');
			for (const seed of peers) {
				const [ip, port] = seed.split(':');
				if (!ip || !port || Number.isNaN(Number(port))) {
					this.error('Invalid ip or port is specified.');
				}
				config.network.seedPeers.push({ ip, port: Number(port) });
			}
		}
		// Plugin configs
		if (flags['http-api-port'] !== undefined) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			config.plugins[HTTPAPIPlugin.alias] = config.plugins[HTTPAPIPlugin.alias] ?? {};
			config.plugins[HTTPAPIPlugin.alias].port = flags['http-api-port'];
		}
		if (flags['http-api-whitelist'] !== undefined) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			config.plugins[HTTPAPIPlugin.alias] = config.plugins[HTTPAPIPlugin.alias] ?? {};
			config.plugins[HTTPAPIPlugin.alias].whiteList = flags['http-api-whitelist'].split(',');
		}
		if (flags['forger-port'] !== undefined) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			config.plugins[ForgerPlugin.alias] = config.plugins[ForgerPlugin.alias] ?? {};
			config.plugins[ForgerPlugin.alias].port = flags['forger-port'];
		}
		if (flags['forger-whitelist'] !== undefined) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			config.plugins[ForgerPlugin.alias] = config.plugins[ForgerPlugin.alias] ?? {};
			config.plugins[ForgerPlugin.alias].whiteList = flags['forger-whitelist'].split(',');
		}
		// Get application and start
		try {
			const app = getApplication(networkConfigs.genesisBlock, config, {
				enableHTTPAPI: flags['enable-http-api'],
				enableForger: flags['enable-forger'],
			});
			await app.run();
		} catch (errors) {
			this.error(
				Array.isArray(errors) ? errors.map(err => (err as Error).message).join(',') : errors,
			);
		}
	}
}
