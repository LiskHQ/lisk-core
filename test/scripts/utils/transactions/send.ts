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
/* eslint-disable no-console, @typescript-eslint/restrict-template-expressions */

import { apiClient, codec, transactions, RegisteredSchema } from 'lisk-sdk';
import { PassphraseAndKeys } from '../accounts';
import {
	createTransferTransaction,
	createDelegateRegisterTransaction,
	createDelegateVoteTransaction,
	Vote,
	createMultiSignRegisterTransaction,
	createMultisignatureTransferTransaction,
} from './create';

export const getBeddows = (lskAmount: string) =>
	BigInt(transactions.convertLSKToBeddows(lskAmount));

const generateRandomUserName = () => {
	const allLowerAlpha = [...'abcdefghijklmnopqrstuvwxyz'];

	const base = [...allLowerAlpha];

	return [...Array(20)].map(() => base[(Math.random() * base.length) | 0]).join('');
};

const nonceSequenceItems = (AccountNonce: number, count = 63) => [
	AccountNonce,
	...Array.from({ length: count }, (_, k) => AccountNonce + k + 1),
];

const getAccount = async (
	address: string,
	client: apiClient.APIClient,
): Promise<Record<string, unknown>> => {
	const schema = await client.invoke<RegisteredSchema>('app:getSchema');
	const account = await client.invoke<string>('app:getAccount', {
		address,
	});

	return codec.decodeJSON(schema.account, Buffer.from(account, 'hex'));
};

const getAccountNonce = async (address: string, client: apiClient.APIClient): Promise<number> => {
	const account = await getAccount(address, client);
	const { sequence } = account as { sequence: { nonce: string } };
	return Number(sequence.nonce);
};

const handleTransaction = async (
	transaction: Record<string, unknown>,
	transactionMessage: string,
	client: apiClient.APIClient,
) => {
	try {
		const result: any = await client.transaction.send(transaction);

		if (result.transactionId) {
			console.log(`Sending ${transactionMessage} transaction: ${result.transactionId}`);
		} else {
			console.log(`Failed to send ${transactionMessage} transaction: ${transaction}`);
		}
	} catch (error) {
		console.error(`Error while sending ${transactionMessage} transaction: \n`, error);
	}
};

export const sendTokenTransferTransactions = async (
	nodeInfo: Record<string, unknown>,
	accounts: PassphraseAndKeys[],
	fromAccount: PassphraseAndKeys,
	fromGenesis = true,
	client: apiClient.APIClient,
) => {
	const AccountNonce = fromGenesis
		? await getAccountNonce(fromAccount.address.toString('hex'), client)
		: 0;

	const { networkIdentifier } = nodeInfo as { networkIdentifier: string };
	const transferTransactions = await Promise.all(
		nonceSequenceItems(AccountNonce).map(async (nonce, index) => {
			const trx = await createTransferTransaction(
				{
					nonce: BigInt(nonce),
					recipientAddress: accounts[index].address,
					amount: getBeddows(fromGenesis ? '2000' : '25'),
					fee: getBeddows('0.1'),
					networkIdentifier: Buffer.from(networkIdentifier, 'hex'),
					passphrase: fromAccount.passphrase,
				},
				client,
			);

			return trx;
		}),
	);

	for (let i = 0; i < transferTransactions.length; i += 1) {
		await handleTransaction(transferTransactions[i], 'token transfer', client);
	}
};

export const sendDelegateRegistrationTransaction = async (
	nodeInfo: Record<string, unknown>,
	fromAccount: PassphraseAndKeys,
	client: apiClient.APIClient,
) => {
	const AccountNonce = await getAccountNonce(fromAccount.address.toString('hex'), client);
	const username = generateRandomUserName();

	const { networkIdentifier } = nodeInfo as { networkIdentifier: string };
	const transaction = await createDelegateRegisterTransaction(
		{
			nonce: BigInt(AccountNonce),
			username,
			fee: getBeddows('15'),
			networkIdentifier: Buffer.from(networkIdentifier, 'hex'),
			passphrase: fromAccount.passphrase,
		},
		client,
	);

	await handleTransaction(transaction, 'delegate registration', client);
};

export const sendVoteTransaction = async (
	nodeInfo: Record<string, unknown>,
	fromAccount: PassphraseAndKeys,
	votes: Vote[],
	client: apiClient.APIClient,
) => {
	const AccountNonce = await getAccountNonce(fromAccount.address.toString('hex'), client);

	const { networkIdentifier } = nodeInfo as { networkIdentifier: string };
	const transaction = await createDelegateVoteTransaction(
		{
			nonce: BigInt(AccountNonce),
			votes,
			fee: getBeddows('0.3'),
			networkIdentifier: Buffer.from(networkIdentifier, 'hex'),
			passphrase: fromAccount.passphrase,
		},
		client,
	);

	await handleTransaction(transaction, 'vote', client);
};

export const sendMultiSigRegistrationTransaction = async (
	nodeInfo: Record<string, unknown>,
	fromAccount: PassphraseAndKeys,
	asset: { mandatoryKeys: Buffer[]; optionalKeys: Buffer[]; numberOfSignatures: number },
	passphrases: string[],
	client: apiClient.APIClient,
) => {
	const AccountNonce = await getAccountNonce(fromAccount.address.toString('hex'), client);

	const { networkIdentifier } = nodeInfo as { networkIdentifier: string };
	const transaction = await createMultiSignRegisterTransaction(
		{
			nonce: BigInt(AccountNonce),
			mandatoryKeys: asset.mandatoryKeys,
			optionalKeys: asset.optionalKeys,
			numberOfSignatures: asset.numberOfSignatures,
			senderPassphrase: fromAccount.passphrase,
			fee: getBeddows('0.5'),
			networkIdentifier: Buffer.from(networkIdentifier, 'hex'),
			passphrases,
		},
		client,
	);

	await handleTransaction(transaction, 'multi signature registration', client);
};

export const sendTransferTransactionFromMultiSigAccount = async (
	nodeInfo: Record<string, unknown>,
	fromAccount: PassphraseAndKeys,
	asset: { mandatoryKeys: Buffer[]; optionalKeys: Buffer[] },
	passphrases: string[],
	client: apiClient.APIClient,
) => {
	const AccountNonce = await getAccountNonce(fromAccount.address.toString('hex'), client);

	const { networkIdentifier } = nodeInfo as { networkIdentifier: string };
	const transaction = await createMultisignatureTransferTransaction(
		{
			senderPublicKey: fromAccount.publicKey,
			recipientAddress: fromAccount.address,
			amount: getBeddows('1'),
			nonce: BigInt(AccountNonce),
			mandatoryKeys: asset.mandatoryKeys,
			optionalKeys: asset.optionalKeys,
			fee: getBeddows('0.5'),
			networkIdentifier: Buffer.from(networkIdentifier, 'hex'),
			passphrases,
		},
		client,
	);

	await handleTransaction(transaction, 'transfer transaction from multisig account', client);
};
