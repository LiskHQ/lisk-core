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

import { Readable } from 'stream';
import * as crypto from 'crypto';
import { expect, test } from '@oclif/test';
import * as sandbox from 'sinon';
import { homedir } from 'os';
import { join } from 'path';
import * as appUtils from '../../../src/utils/application';
import * as dbUtils from '../../../src/utils/db';

const defaultDataPath = join(homedir(), '.lisk', 'default');

describe('blockchain:hash', () => {
	const pid = 56869;
	const hashBuffer = Buffer.from('dasfadsfdsaf787899afffadsfadsf');
	const KVStoreStubInstance = {
		createReadStream: sandbox.stub().returns(Readable.from([hashBuffer])),
	};
	const hashStub = {
		update: sandbox.stub(),
		digest: sandbox.stub().returns(hashBuffer),
	};

	const setupTest = () =>
		test
			.stub(dbUtils, 'getBlockchainDB', sandbox.stub().returns(KVStoreStubInstance))
			.stub(appUtils, 'getPid', sandbox.stub().returns(pid))
			.stub(crypto, 'createHash', sandbox.stub().returns(hashStub))
			.stdout()
			.stderr();

	afterEach(() => {
		// To rewind readable stream have to override value every test
		KVStoreStubInstance.createReadStream = sandbox.stub().returns(Readable.from([hashBuffer]));

		hashStub.update.resetHistory();
		hashStub.digest.resetHistory();
	});

	describe('when application is running', () => {
		describe('when starting without flag', () => {
			setupTest()
				.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(true))
				.command(['blockchain:hash'])
				.catch(error => {
					expect(error.message).to.equal(
						`Can't generate hash for a running application. Application at data path ${defaultDataPath} is running with pid ${pid}.`,
					);
				})
				.it('should log error and return');
		});

		describe('when starting with particular data-path', () => {
			setupTest()
				.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(true))
				.command(['blockchain:hash', '--data-path=/my/app/'])
				.catch(error => {
					expect(error.message).to.equal(
						`Can't generate hash for a running application. Application at data path /my/app/ is running with pid ${pid}.`,
					);
				})
				.it('should log error and return');
		});
	});

	describe('when application is not running', () => {
		describe('when starting without flag', () => {
			setupTest()
				.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(false))
				.command(['blockchain:hash'])
				.it('should create db object for "blockchain.db" for default data path', () => {
					expect(dbUtils.getBlockchainDB).to.have.been.calledOnce;
					expect(dbUtils.getBlockchainDB).to.have.been.calledWithExactly(defaultDataPath);
				});

			setupTest()
				.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(false))
				.command(['blockchain:hash'])
				.it('should hash the value read from db stream', () => {
					expect(crypto.createHash).to.have.been.calledOnce;
					expect(crypto.createHash).to.have.been.calledWithExactly('sha256');
					expect(hashStub.update).to.have.been.calledOnce;
					expect(hashStub.update).to.have.been.calledWithExactly(hashBuffer);
					expect(hashStub.digest).to.have.been.calledOnce;
				});

			setupTest()
				.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(false))
				.command(['blockchain:hash'])
				.it('should output the hash db values', ctx => {
					expect(ctx.stdout).to.equal(`${hashBuffer.toString('base64')}\n`);
				});
		});

		describe('when starting with particular data-path', () => {
			setupTest()
				.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(false))
				.command(['blockchain:hash', '--data-path=/my/app/'])
				.it('should create db object for "blockchain.db" for given data path', () => {
					expect(dbUtils.getBlockchainDB).to.have.been.calledOnce;
					expect(dbUtils.getBlockchainDB).to.have.been.calledWithExactly('/my/app/');
				});

			setupTest()
				.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(false))
				.command(['blockchain:hash'])
				.it('should hash the value read from db stream', () => {
					expect(crypto.createHash).to.have.been.calledOnce;
					expect(crypto.createHash).to.have.been.calledWithExactly('sha256');
					expect(hashStub.update).to.have.been.calledOnce;
					expect(hashStub.update).to.have.been.calledWithExactly(hashBuffer);
					expect(hashStub.digest).to.have.been.calledOnce;
				});

			setupTest()
				.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(false))
				.command(['blockchain:hash', '--data-path=/my/app/'])
				.it('should output the hash db values', ctx => {
					expect(ctx.stdout).to.equal(`${hashBuffer.toString('base64')}\n`);
				});
		});
	});
});
