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
const {
	cryptography,
	blockHeaderAssetSchema,
	blockHeaderSchema,
	codec,
	blockSchema,
	Transaction,
	signingBlockHeaderSchema,
} = require('lisk-sdk');
const { events } = require('@liskhq/lisk-p2p');
const { getP2PClient, networkIdentifier } = require('../utils/p2p');
const { Mnemonic } = require('@liskhq/lisk-passphrase');
const { MerkleTree } = require('@liskhq/lisk-tree');
const { getRandomBytes } = require('../../../lisk-sdk/node_modules/@liskhq/lisk-cryptography/dist-node');

const postBlock = (p2p, blockBytes) => {
	p2p.send({
		event: 'postBlock',
		data: {
			block: blockBytes.toString('hex'),
		},
	});
}

const run = async () => {
	const p2p = getP2PClient('127.0.0.1', 5000);
	await p2p.start();

	await new Promise(resolve => setTimeout(resolve), 10000);
	p2p.on(events.EVENT_MESSAGE_RECEIVED, event => {
		if (event.event !== 'postBlock') {
			return;
		}
		console.log('Starting to resend block');
		const blockBuffer = Buffer.from(event.data.block, 'hex');
		const block = codec.decode(blockSchema, blockBuffer);
		const header = codec.decode(blockHeaderSchema, block.header);
		const asset = codec.decode(blockHeaderAssetSchema, header.asset);
		const assetBytes = codec.encode(blockHeaderAssetSchema, {
			...asset,
			// seedReveal: cryptography.getRandomBytes(16),
			maxHeightPrevoted: asset.maxHeightPrevoted + 100,
			// maxHeightPreviouslyForged: 99,
		});
		const passphrase = Mnemonic.generateMnemonic();
		const { publicKey } = cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);
		const tx = new Transaction({
			moduleID: 99,
			assetID: 23,
			senderPublicKey: cryptography.getRandomBytes(32),
			fee: 100000000n,
			nonce: 0n,
			signatures: [cryptography.getRandomBytes(64)],
			asset: cryptography.getRandomBytes(32),
		});
		const transactionRoot = new MerkleTree([tx.id]).root;
		const signingHeader = {
			...header,
			// version: 2,
			timestamp: Math.floor(Date.now() / 1000) + 10,
			// previousBlockID: Buffer.alloc(0),
			height: header.height + 100,
			// transactionRoot,
			// transactionRoot: cryptography.getRandomBytes(32),
			// transactionRoot: Buffer.from('47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=', 'hex'),
			generatorPublicKey: publicKey,
			reward: 500000000n,
			asset: assetBytes,
		};
		const signingHeaderBytes = codec.encode(signingBlockHeaderSchema, signingHeader);
		const signature = cryptography.signData(Buffer.concat([networkIdentifier, signingHeaderBytes]), passphrase);
		const headerBytes = codec.encode(blockHeaderSchema, {
			...signingHeader,
			signature,
		});

		const encodedBlock = codec.encode(blockSchema, {
			header: headerBytes,
			// payload: [tx.getBytes()],
			payload: [],
		});
		// Re-broadcast
		// postBlock(p2p, encodedBlock);
		postBlock(p2p, getRandomBytes(500));
	});
}


(async () => {
	await run();
})()