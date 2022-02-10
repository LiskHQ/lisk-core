/*
 * Copyright © 2019 Lisk Foundation
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
import { Application, PartialApplicationConfig } from 'lisk-sdk';
import { FaucetPlugin } from '@liskhq/lisk-framework-faucet-plugin';
import { ForgerPlugin } from '@liskhq/lisk-framework-forger-plugin';
import { ReportMisbehaviorPlugin } from '@liskhq/lisk-framework-report-misbehavior-plugin';
import { MonitorPlugin } from '@liskhq/lisk-framework-monitor-plugin';

export interface Options {
	enableFaucetPlugin: boolean;
	enableForgerPlugin: boolean;
	enableMonitorPlugin: boolean;
	enableReportMisbehaviorPlugin: boolean;
}

export const getApplication = (config: PartialApplicationConfig, options: Options): Application => {
	const { app } = Application.defaultApplication(config);

	// Instatiate and register modules and plugins
	if (options.enableFaucetPlugin) {
		app.registerPlugin(new FaucetPlugin(), { loadAsChildProcess: true });
	}
	if (options.enableForgerPlugin) {
		app.registerPlugin(new ForgerPlugin(), { loadAsChildProcess: true });
	}
	if (options.enableMonitorPlugin) {
		app.registerPlugin(new MonitorPlugin(), { loadAsChildProcess: true });
	}
	if (options.enableReportMisbehaviorPlugin) {
		app.registerPlugin(new ReportMisbehaviorPlugin(), { loadAsChildProcess: true });
	}

	return app;
};
