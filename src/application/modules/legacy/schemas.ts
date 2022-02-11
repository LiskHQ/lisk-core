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
 */

export const legacyAccountsSchema = {
	$id: 'lisk/legacyAccount/balance',
	type: 'object',
	required: ['balance'],
	properties: {
		balance: {
			dataType: 'uint64',
			fieldNumber: 1,
		},
	},
};

export const reclaimParamsSchema = {
	$id: 'lisk/legacyAccount/reclaim',
	type: 'object',
	required: ['amount'],
	properties: {
		amount: {
			dataType: 'uint64',
			fieldNumber: 1,
		},
	},
};

export const registerBLSKeyParamsSchema = {
	$id: 'lisk/legacyAccount/registerBLSKey',
	type: 'object',
	required: ['blsKey', 'proofOfPossession'],
	properties: {
		blsKey: {
			dataType: 'bytes',
			fieldNumber: 1,
		},
		proofOfPossession: {
			dataType: 'bytes',
			fieldNumber: 2,
		},
	},
};
