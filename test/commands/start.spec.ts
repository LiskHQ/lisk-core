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

import { expect, test } from '@oclif/test';
import * as sandbox from 'sinon';
import * as fs from 'fs-extra';
import * as os from 'os';
import { Application } from 'lisk-sdk';
import * as application from '../../src/application';
import * as mainnetGenesisBlock from '../../src/config/mainnet/genesis_block.json';

import pJSON = require('../../package.json');

describe('start', () => {
	const readJSONStub = sandbox.stub();
	readJSONStub.withArgs('./config.json').resolves({
		logger: {
			consoleLogLevel: 'error',
		},
	});

	const setupTest = () =>
		test
			.stub(
				application,
				'getApplication',
				sandbox.stub().returns({
					run: async () => Promise.resolve(),
				} as Application),
			)
			.stub(fs, 'readJSON', readJSONStub)
			.stub(os, 'homedir', sandbox.stub().returns('~'))
			.stdout();

	describe('when starting without flag', () => {
		setupTest()
			.command(['start'])
			.it('should start with default mainnet config', () => {
				const [
					usedGenesisBlock,
					usedConfig,
				] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedGenesisBlock.id).to.eql(mainnetGenesisBlock.id);
				expect(usedConfig.version).to.equal(pJSON.version);
				expect(usedConfig.label).to.equal('default');
			});
	});

	describe('when unknown network is specidied', () => {
		setupTest()
			.command(['start', '--network=unknown'])
			.catch(err =>
				expect(err.message).to.include(
					'Network must be one of devnet,alphanet,betanet,testnet,mainnet',
				),
			)
			.it('should throw an error');
	});

	describe('when enable-ipc is specified', () => {
		setupTest()
			.command(['start', '--enable-ipc'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.ipc.enabled).to.equal(true);
			});
	});

	describe('when config is specified', () => {
		setupTest()
			.command(['start', '--config=./config.json'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(readJSONStub).to.have.been.calledWithExactly('./config.json');
				expect(usedConfig.logger.consoleLogLevel).to.equal('error');
			});
	});

	describe('when log is specified', () => {
		setupTest()
			.command(['start', '--console-log=trace'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.logger.consoleLogLevel).to.equal('trace');
			});

		setupTest()
			.env({ LISK_CONSOLE_LOG_LEVEL: 'error' })
			.command(['start'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.logger.consoleLogLevel).to.equal('error');
			});
	});

	describe('when file log is specified', () => {
		setupTest()
			.command(['start', '--log=trace'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.logger.fileLogLevel).to.equal('trace');
			});

		setupTest()
			.env({ LISK_FILE_LOG_LEVEL: 'trace' })
			.command(['start'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.logger.fileLogLevel).to.equal('trace');
			});
	});

	describe('when port is specified', () => {
		setupTest()
			.command(['start', '--port=1111'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.network.port).to.equal(1111);
			});

		setupTest()
			.env({ LISK_PORT: '1234' })
			.command(['start'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.network.port).to.equal(1234);
			});
	});

	describe('when peer is specified', () => {
		setupTest()
			.command(['start', '--peers=localhost:12234'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.network.seedPeers).to.eql([{ ip: 'localhost', port: 12234 }]);
			});

		setupTest()
			.command(['start', '--peers=localhost:12234,74.49.3.35:2238'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.network.seedPeers).to.eql([
					{ ip: 'localhost', port: 12234 },
					{ ip: '74.49.3.35', port: 2238 },
				]);
			});
	});
});
