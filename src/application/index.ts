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
import {
	Application,
	HTTPAPIPlugin,
	ForgerPlugin,
	MonitorPlugin,
	PartialApplicationConfig,
	ReportMisbehaviorPlugin,
} from 'lisk-sdk';
import { LegacyAccountModule } from './modules';
import {
	StressPlugin,
} from './plugins/stress-plugin';

export interface Options {
	enableHTTPAPIPlugin: boolean;
	enableForgerPlugin: boolean;
	enableMonitorPlugin: boolean;
	enableReportMisbehaviorPlugin: boolean;
	enableStress: boolean;
}

// Temporally disable eslint
/* eslint-disable */
export const getApplication = (
	genesisBlock: Record<string, unknown>,
	config: PartialApplicationConfig,
	options: Options,
): Application => {
	const app = Application.defaultApplication(genesisBlock, config);
	app.registerModule(LegacyAccountModule);

	if (options.enableHTTPAPIPlugin) {
		app.registerPlugin(HTTPAPIPlugin, { loadAsChildProcess: true });
	}
	if (options.enableForgerPlugin) {
		app.registerPlugin(ForgerPlugin, { loadAsChildProcess: true });
	}
	if (options.enableMonitorPlugin) {
		app.registerPlugin(MonitorPlugin, { loadAsChildProcess: true });
	}
	if (options.enableReportMisbehaviorPlugin) {
		app.registerPlugin(ReportMisbehaviorPlugin, { loadAsChildProcess: true });
	}
	if (options.enableStress) {
		app.registerPlugin(StressPlugin);
	}

	return app;
};
