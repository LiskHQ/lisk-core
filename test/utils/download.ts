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
 */

import * as sandbox from 'sinon';
import { expect } from 'chai';
import * as fs from 'fs-extra';
import * as axios from 'axios';
import { SinonStub } from 'sinon';
import * as downloadUtil from '../../src/utils/download';

describe('download utils', () => {
	const url = 'https://downloads.lisk.io/lisk/betanet/blockchain.db.gz';
	const outDir = '~/.cache/lisk-core';

	describe('#download', () => {
		let existsSyncStub: SinonStub;
		let statSyncStub: SinonStub;

		beforeEach(() => {
			sandbox.stub(axios, 'default');
			existsSyncStub = sandbox.stub(fs, 'existsSync');
			statSyncStub = sandbox.stub(fs, 'statSync');
			sandbox.stub(fs, 'unlinkSync').returns();
		});

		it('should return true if downloaded file', () => {
			existsSyncStub.returns(true);
			statSyncStub.returns({ birthtime: new Date() });

			return expect(downloadUtil.download(url, outDir)).returned;
		});
	});

	describe('#downloadLiskAndValidate', () => {
		let readFileSyncStub: SinonStub;
		let verifyChecksumStub: SinonStub;

		beforeEach(() => {
			sandbox.stub(downloadUtil, 'download');
			verifyChecksumStub = sandbox.stub(downloadUtil, 'verifyChecksum');
			sandbox
				.stub(downloadUtil, 'getDownloadedFileInfo')
				.returns({ fileDir: '', fileName: '', filePath: '' });
			readFileSyncStub = sandbox.stub(fs, 'readFileSync');
		});

		it('should download lisk and validate release', async () => {
			readFileSyncStub
				.onCall(0)
				.returns(
					'7607d6792843d6003c12495b54e34517a508d2a8622526aff1884422c5478971 tar filename here',
				);

			await downloadUtil.downloadAndValidate(url, outDir);
			expect(downloadUtil.download).to.be.calledTwice;
			return expect(downloadUtil.getDownloadedFileInfo).to.be.calledOnce;
		});

		it('should throw error when validation fails', async () => {
			readFileSyncStub
				.onCall(0)
				.returns(
					'9897d6792843d6003c12495b54e34517a508d2a8622526aff1884422c5478971 tar filename here',
				);
			verifyChecksumStub.rejects(new Error('Checksum did not match'));

			return expect(downloadUtil.downloadAndValidate(url, outDir)).to.rejectedWith(
				'Checksum did not match',
			);
		});
	});
});
