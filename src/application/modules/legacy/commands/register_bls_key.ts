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

import { BaseCommand } from 'lisk-sdk';
import { COMMAND_ID_REGISTER_BLS_KEY } from '../constants';

export class RegisterBLSKeyCommand extends BaseCommand {
	public id = COMMAND_ID_REGISTER_BLS_KEY;
	public name = 'registerblskey';

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public async execute(): Promise<void> {}
}
