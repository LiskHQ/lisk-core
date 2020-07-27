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
import { IPCChannel } from 'lisk-sdk';
import baseIPC from '../../../src/base_ipc';

describe('account:get command', () => {
	const queryResult = {
		address: '',
	};
	const address = 'w6sqwjUS2b9isCd14iz4DfgU6xs=';
	const fsStub = sandbox.stub().returns(true);
	const printJSONStub = sandbox.stub().returns(queryResult);
	const ipcInvokeStub = sandbox.stub();
	const ipcStartAndListenStub = sandbox.stub();
	ipcInvokeStub
		.withArgs('app:getSchema')
		.resolves({
			account: {
				$id: 'dummy',
				type: 'object',
				properties: { address: { dataType: 'bytes' } },
			},
		})
		.withArgs('app:getAccount', { address })
		.resolves(
			'ChTDqyrCNRLZv2KwJ3XiLPgN+BTrGxAAGAAiAggAKjoKGQoKZ2VuZXNpc184NhgAIAAoADCAoJSljR0SHQoUw6sqwjUS2b9isCd14iz4DfgU6xsQgKCUpY0d',
		);

	const setupTest = () =>
		test
			.stub(fs, 'existsSync', fsStub)
			.stub(baseIPC.prototype, 'printJSON', printJSONStub)
			.stub(IPCChannel.prototype, 'startAndListen', ipcStartAndListenStub)
			.stub(IPCChannel.prototype, 'invoke', ipcInvokeStub);

	describe('account:get', () => {
		setupTest()
			.command(['account:get'])
			.catch((error: Error) => expect(error.message).to.contain('Missing 1 required arg'))
			.it('should throw an error when arg is not provided');
	});

	describe('account:get address', () => {
		setupTest()
			.command(['account:get', address])
			.it('should get an account info and display as an object', () => {
				expect(ipcInvokeStub).to.have.been.calledTwice;
				expect(ipcInvokeStub).to.have.been.calledWithExactly('app:getSchema');
				expect(ipcInvokeStub).to.have.been.calledWithExactly('app:getAccount', {
					address,
				});
				expect(printJSONStub).to.have.been.calledOnce;
				expect(printJSONStub).to.have.been.calledWithExactly(queryResult);
			});
	});

	describe('account:get unknown_address', () => {
		ipcInvokeStub
			.withArgs('app:getAccount', { address: 'unknown_address' })
			.rejects(new Error('unknown address'));
		setupTest()
			.command(['account:get', 'unknown_address'])
			.catch((error: Error) => expect(error.message).to.contain('unknown address'))
			.it('should throw an error when unknown address is specified');
	});
});
