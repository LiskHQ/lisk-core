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

import { passphrase as liskPassphrase, cryptography } from 'lisk-sdk';

const { Mnemonic } = liskPassphrase;

export interface PassphraseAndKeys {
	passphrase: string;
	privateKey?: Buffer;
	publicKey: Buffer;
	address: Buffer;
}

export const createAccount = () => {
	const passphrase = Mnemonic.generateMnemonic();
	const { privateKey, publicKey } = cryptography.getKeys(passphrase);
	const address = cryptography.getAddressFromPublicKey(publicKey);

	return {
		passphrase,
		privateKey,
		publicKey,
		address,
	};
};

const passphrase = 'peanut hundred pen hawk invite exclude brain chunk gadget wait wrong ready';

export const genesisAccount = {
	address: cryptography.getAddressFromPassphrase(passphrase),
	...cryptography.getKeys(passphrase),
	passphrase,
	password: 'elephant tree paris dragon chair galaxy',
};
