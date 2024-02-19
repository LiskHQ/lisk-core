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
 *
 */
/* eslint-disable no-param-reassign */
import { Flags as flagParser } from '@oclif/core';
import * as path from 'path';
import * as fs from 'fs';
import { BaseStartCommand } from 'lisk-commander';
import {
	Application,
	ApplicationConfig,
	PartialApplicationConfig,
	applicationConfigSchema,
	utils,
} from 'lisk-sdk';
import { MonitorPlugin } from '@liskhq/lisk-framework-monitor-plugin';
import { ForgerPlugin } from '@liskhq/lisk-framework-forger-plugin';
import { ReportMisbehaviorPlugin } from '@liskhq/lisk-framework-report-misbehavior-plugin';
import { FaucetPlugin } from '@liskhq/lisk-framework-faucet-plugin';
import { ChainConnectorPlugin } from '@liskhq/lisk-framework-chain-connector-plugin';
import { getApplication } from '../application';
import DownloadCommand from './genesis-block/download';
import { DEFAULT_NETWORK, NETWORK } from '../constants';
import { flags as commonFlags } from '../utils/flags';

interface Flags {
	[key: string]: string | number | boolean | undefined;
}

const setPluginConfig = (config: ApplicationConfig, flags: Flags): void => {
	if (flags['monitor-plugin-port'] !== undefined) {
		config.plugins[MonitorPlugin.name] = config.plugins[MonitorPlugin.name] ?? {};
		config.plugins[MonitorPlugin.name].port = flags['monitor-plugin-port'];
	}
	if (
		flags['monitor-plugin-whitelist'] !== undefined &&
		typeof flags['monitor-plugin-whitelist'] === 'string'
	) {
		config.plugins[MonitorPlugin.name] = config.plugins[MonitorPlugin.name] ?? {};
		config.plugins[MonitorPlugin.name].whiteList = flags['monitor-plugin-whitelist']
			.split(',')
			.filter(Boolean);
	}
	if (flags['faucet-plugin-port'] !== undefined) {
		config.plugins[FaucetPlugin.name] = config.plugins[FaucetPlugin.name] ?? {};
		config.plugins[FaucetPlugin.name].port = flags['faucet-plugin-port'];
	}
};

export class StartCommand extends BaseStartCommand {
	static flags = {
		...BaseStartCommand.flags,
		network: flagParser.string({
			...commonFlags.network,
			env: 'LISK_NETWORK',
			default: DEFAULT_NETWORK,
		}),
		'enable-forger-plugin': flagParser.boolean({
			description:
				'Enable Forger Plugin. Environment variable "LISK_ENABLE_FORGER_PLUGIN" can also be used.',
			env: 'LISK_ENABLE_FORGER_PLUGIN',
			default: false,
		}),
		'enable-monitor-plugin': flagParser.boolean({
			description:
				'Enable Monitor Plugin. Environment variable "LISK_ENABLE_MONITOR_PLUGIN" can also be used.',
			env: 'LISK_ENABLE_MONITOR_PLUGIN',
			default: false,
		}),
		'monitor-plugin-port': flagParser.integer({
			description:
				'Port to be used for Monitor Plugin. Environment variable "LISK_MONITOR_PLUGIN_PORT" can also be used.',
			env: 'LISK_MONITOR_PLUGIN_PORT',
			dependsOn: ['enable-monitor-plugin'],
		}),
		'monitor-plugin-whitelist': flagParser.string({
			description:
				'List of IPs in comma separated value to allow the connection. Environment variable "LISK_MONITOR_PLUGIN_WHITELIST" can also be used.',
			env: 'LISK_MONITOR_PLUGIN_WHITELIST',
			dependsOn: ['enable-monitor-plugin'],
		}),
		'enable-report-misbehavior-plugin': flagParser.boolean({
			description:
				'Enable ReportMisbehavior Plugin. Environment variable "LISK_ENABLE_REPORT_MISBEHAVIOR_PLUGIN" can also be used.',
			env: 'LISK_ENABLE_REPORT_MISBEHAVIOR_PLUGIN',
			default: false,
		}),
		'enable-faucet-plugin': flagParser.boolean({
			description:
				'Enable Faucet Plugin. Environment variable "LISK_ENABLE_FAUCET_PLUGIN" can also be used.',
			env: 'LISK_ENABLE_FAUCET_PLUGIN',
			default: false,
		}),
		'faucet-plugin-port': flagParser.integer({
			description:
				'Port to be used for Faucet Plugin. Environment variable "LISK_FAUCET_PLUGIN_PORT" can also be used.',
			env: 'LISK_FAUCET_PLUGIN_PORT',
			dependsOn: ['enable-faucet-plugin'],
		}),
		'enable-dashboard-plugin': flagParser.boolean({
			description:
				'Enable Dashboard Plugin. Environment variable "LISK_ENABLE_DASHBOARD_PLUGIN" can also be used.',
			env: 'LISK_ENABLE_DASHBOARD_PLUGIN',
			default: false,
		}),
		'dashboard-plugin-port': flagParser.integer({
			description:
				'Port to be used for Dashboard Plugin. Environment variable "LISK_DASHBOARD_PLUGIN_PORT" can also be used.',
			env: 'LISK_DASHBOARD_PLUGIN_PORT',
			dependsOn: ['enable-dashboard-plugin'],
		}),
		'enable-chain-connector-plugin': flagParser.boolean({
			description:
				'Enable Chain Connector Plugin. Environment variable "LISK_ENABLE_CHAIN_CONNECTOR_PLUGIN" can also be used.',
			env: 'LISK_ENABLE_CHAIN_CONNECTOR_PLUGIN',
			default: false,
		}),
		'genesis-block-url': flagParser.string({
			char: 'u',
			description:
				'The URL to download the genesis block. Environment variable "LISK_GENESIS_BLOCK_URL" can also be used. Kindly ensure that the provided URL downloads the genesis block \'blob\' in the tarball format.',
			env: 'LISK_GENESIS_BLOCK_URL',
		}),
		'overwrite-genesis-block': flagParser.boolean({
			description:
				'Download and overwrite existing genesis block. Environment variable "LISK_GENESIS_BLOCK_OVERWRITE" can also be used.',
			env: 'LISK_GENESIS_BLOCK_OVERWRITE',
			default: false,
		}),
	};

	public async init(): Promise<void> {
		// Download Genesis block
		const { flags } = await this.parse(StartCommand);
		if (
			[NETWORK.MAINNET, NETWORK.TESTNET].includes(flags.network as NETWORK) &&
			(!fs.existsSync(
				path.resolve(this.getApplicationConfigDir(), flags.network, 'genesis_block.blob'),
			) ||
				flags['overwrite-genesis-block'])
		) {
			if (flags['overwrite-genesis-block']) {
				this.log(`Overwriting genesis block for "${flags.network}".`);
			} else {
				this.log(`Genesis block for "${flags.network}" does not exist.`);
			}

			const downloadParamsForAppConfig = [
				'--data-path',
				this.getApplicationDir(),
				'--network',
				flags.network,
			];
			if (flags['overwrite-genesis-block']) {
				downloadParamsForAppConfig.push('--force');
			}
			if (flags['genesis-block-url']) {
				downloadParamsForAppConfig.push('--url', flags['genesis-block-url']);
			}

			await DownloadCommand.run(downloadParamsForAppConfig);
		}
	}

	public async getApplication(config: PartialApplicationConfig): Promise<Application> {
		const { flags } = await this.parse(StartCommand);

		// Set Plugins Config
		setPluginConfig(config as ApplicationConfig, flags);
		const app = getApplication(
			utils.objects.mergeDeep({}, applicationConfigSchema.default, config),
		);

		if (flags['enable-forger-plugin']) {
			app.registerPlugin(new ForgerPlugin() as any, { loadAsChildProcess: true });
		}
		if (flags['enable-monitor-plugin']) {
			app.registerPlugin(new MonitorPlugin() as any, { loadAsChildProcess: true });
		}
		if (flags['enable-report-misbehavior-plugin']) {
			app.registerPlugin(new ReportMisbehaviorPlugin() as any, { loadAsChildProcess: true });
		}
		if (flags['enable-faucet-plugin']) {
			app.registerPlugin(new FaucetPlugin() as any, { loadAsChildProcess: true });
		}
		if (flags['enable-chain-connector-plugin']) {
			app.registerPlugin(new ChainConnectorPlugin() as any, { loadAsChildProcess: true });
		}

		return app;
	}

	public getApplicationConfigDir(): string {
		return path.join(__dirname, '../../config');
	}

	public getApplicationDir(): string {
		return path.join(__dirname, '../..');
	}
}
