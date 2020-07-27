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
import { Application } from 'lisk-sdk';
import * as application from '../../../src/application';
import * as downloadUtils from '../../../src/utils/download';
import { getDefaultPath } from '../../../src/utils/path';

const SNAPSHOT_URL = 'https://downloads.lisk.io/lisk/mainnet/blockchain.db.gz';

describe('blockchain:download', () => {
	const dataPath = getDefaultPath();
	const downloadAndValidateStub = sandbox.stub().resolves(undefined);

	const setupTest = () =>
		test
			.stub(
				application,
				'getApplication',
				sandbox.stub().returns({
					run: async () => Promise.resolve(),
				} as Application),
			)
			.stub(downloadUtils, 'downloadAndValidate', downloadAndValidateStub)
			.stdout();

	afterEach(() => {
		downloadAndValidateStub.resetHistory();
	});

	describe('when downloading without flags', () => {
		setupTest()
			.command(['blockchain:download'])
			.it('should call downloadAndValidate', () => {
				expect(downloadAndValidateStub).to.be.calledOnceWithExactly(SNAPSHOT_URL, dataPath);
			});
	});

	describe('when downloading with network flag', () => {
		setupTest()
			.command(['blockchain:download', '--network=betanet'])
			.it('should call downloadAndValidate', () => {
				expect(downloadAndValidateStub).to.be.calledWithExactly(
					SNAPSHOT_URL.replace('mainnet', 'betanet'),
					dataPath,
				);
			});
	});

	describe('when downloading with output flag', () => {
		setupTest()
			.command(['blockchain:download', '--output=yourpath'])
			.it('should call downloadAndValidate', () => {
				expect(downloadAndValidateStub).to.be.calledWithExactly(SNAPSHOT_URL, 'yourpath');
			});
	});

	describe('when downloading with url flag', () => {
		setupTest()
			.command(['blockchain:download', '--url=yoururl'])
			.it('should call downloadAndValidate', () => {
				expect(downloadAndValidateStub).to.be.calledWithExactly('yoururl', dataPath);
			});
	});
});
