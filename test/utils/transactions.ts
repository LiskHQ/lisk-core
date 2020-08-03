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

import { cryptography, transactions, codec } from 'lisk-sdk';
import { genesisBlock } from '../../src/config/devnet';
import { Schema } from '../../src/base_ipc';

const account = {
	passphrase: 'endless focus guilt bronze hold economy bulk parent soon tower cement venue',
	privateKey:
		'owyeKxBZlwK5hdGP7lVyG1ZpGHfNLHC73BkRgY2ryblQipZYcSU1lbNuL43Ce/9uZ7Ob3UZlMb6cb4xAElOXnA==',
	publicKey: 'UIqWWHElNZWzbi+Nwnv/bmezm91GZTG+nG+MQBJTl5w=',
	address: 'nKvuPSdCZna4Us5rgEyy/f980LU=',
};

export const transferAssetSchema = {
	$id: 'lisk/transfer-transaction',
	title: 'Transfer transaction asset',
	type: 'object',
	required: ['amount', 'recipientAddress', 'data'],
	properties: {
		amount: {
			dataType: 'uint64',
			fieldNumber: 1,
		},
		recipientAddress: {
			dataType: 'bytes',
			fieldNumber: 2,
			minLength: 20,
			maxLength: 20,
		},
		data: {
			dataType: 'string',
			fieldNumber: 3,
			minLength: 0,
			maxLength: 64,
		},
	},
};

export const genesisBlockTransactionRoot = Buffer.from(
	genesisBlock.header.transactionRoot,
	'base64',
);
export const communityIdentifier = 'Lisk';

export const networkIdentifier = cryptography.getNetworkIdentifier(
	genesisBlockTransactionRoot,
	communityIdentifier,
);

export const createTransferTransaction = ({
	amount,
	fee,
	recipientAddress,
	nonce,
}: {
	amount: string;
	fee: string;
	recipientAddress: string;
	nonce: number;
}): transactions.TransactionJSON => {
	const transaction = new transactions.TransferTransaction({
		nonce: BigInt(nonce),
		fee: BigInt(transactions.utils.convertLSKToBeddows(fee)),
		senderPublicKey: Buffer.from(account.publicKey, 'base64'),
		asset: {
			amount: BigInt(transactions.utils.convertLSKToBeddows(amount)),
			recipientAddress: Buffer.from(recipientAddress, 'base64'),
			data: '',
		},
	});

	transaction.sign(networkIdentifier, account.passphrase);

	return {
		id: transaction.id.toString('base64'),
		type: transaction.type,
		senderPublicKey: transaction.senderPublicKey.toString('base64'),
		signatures: transaction.signatures.map(s => (s as Buffer).toString('base64')),
		asset: {
			...transaction.asset,
			amount: transaction.asset.amount.toString(),
			recipientAddress: transaction.asset.recipientAddress.toString('base64'),
		},
		nonce: transaction.nonce.toString(),
		fee: transaction.fee.toString(),
	};
};

export const encodeTransactionFromJSON = (
	transaction: transactions.TransactionJSON,
	baseSchema: Schema,
	assetsSchemas: { [key: number]: Schema },
): string => {
	const transactionTypeAssetSchema = assetsSchemas[transaction.type];

	if (!transactionTypeAssetSchema) {
		throw new Error('Transaction type not found.');
	}

	const transactionAssetBuffer = codec.encode(
		transactionTypeAssetSchema,
		codec.fromJSON(transactionTypeAssetSchema, transaction.asset),
	);

	const transactionBuffer = codec.encode(
		baseSchema,
		codec.fromJSON(baseSchema, {
			...transaction,
			asset: transactionAssetBuffer,
		}),
	);

	return transactionBuffer.toString('base64');
};
