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

const passphraseDescription = `Specifies a source for your secret passphrase. Command will prompt you for input if this option is not set.
	Examples:
	- --passphrase='my secret passphrase' (should only be used where security is not important)
`;

const passwordDescription = `Specifies a source for your secret password. Command will prompt you for input if this option is not set.
	Examples:
	- --password=pass:password123 (should only be used where security is not important)
`;

export type AlphabetLowercase =
	| 'a'
	| 'b'
	| 'c'
	| 'd'
	| 'e'
	| 'f'
	| 'g'
	| 'h'
	| 'i'
	| 'j'
	| 'k'
	| 'l'
	| 'm'
	| 'n'
	| 'o'
	| 'p'
	| 'q'
	| 'r'
	| 's'
	| 't'
	| 'u'
	| 'v'
	| 'w'
	| 'x'
	| 'y'
	| 'z';

export interface FlagMap {
	readonly [key: string]: {
		readonly char?: AlphabetLowercase;
		readonly description: string;
	};
}

export const flags: FlagMap = {
	passphrase: {
		char: 'p',
		description: passphraseDescription,
	},
	password: {
		char: 'w',
		description: passwordDescription,
	},
	dataPath: {
		char: 'd',
		description:
			'Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH" can also be used.',
	},
};
