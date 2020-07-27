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

import * as childProcess from 'child_process';
import * as fs from 'fs';

const getLastCommitIdFromGit = (): string => {
	const spawn = childProcess.spawnSync('git', ['rev-parse', 'HEAD']);

	if (!spawn.stderr.toString().trim()) {
		return spawn.stdout.toString().trim();
	}

	return '';
};

const getLastCommitIdFromRevisionFile = (): string => {
	// REVISION file is being created in the root folder during build process.
	try {
		return fs.readFileSync('REVISION').toString().trim();
	} catch (error) {
		throw new Error('REVISION file not found.');
	}
};

/**
 * Returns hash of the last git commit if available.
 *
 * @throws {Error} If cannot get last git commit
 */
export const getLastCommitId = (): string => {
	// tslint:disable-next-line no-let
	let lastCommitId = getLastCommitIdFromGit();
	if (!lastCommitId) {
		lastCommitId = getLastCommitIdFromRevisionFile();
	}

	return lastCommitId;
};
