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
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import BaseIPCCommand from '../../base_ipc';

interface Args {
	readonly address: string;
}

export default class GetCommand extends BaseIPCCommand {
	static description = 'Gets account information for a given address from the blockchain';

	static args = [
		{
			name: 'address',
			required: true,
			description: 'Address of an account in a base32 format.',
		},
	];

	static examples = ['account:get qwBBp9P3ssKQtbg01Gvce364WBU='];

	static flags = {
		...BaseIPCCommand.flags,
	};

	async run(): Promise<void> {
		const { args } = this.parse(GetCommand);
		const { address } = args as Args;

		try {
			const account = await this._channel.invoke<string>('app:getAccount', {
				address,
			});
			this.printJSON(this._codec.decodeAccount(account));
		} catch (errors) {
			const errorMessage = Array.isArray(errors)
				? errors.map(err => (err as Error).message).join(',')
				: errors;

			if (/^Specified key accounts:address:(.*)does not exist/.test((errors as Error).message)) {
				this.error(`Account with address '${address}' was not found`);
			} else {
				this.error(errorMessage);
			}
		}
	}
}
