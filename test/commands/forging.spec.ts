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

import * as inquirer from 'inquirer';
import { apiClient } from 'lisk-sdk';
import { when } from 'jest-when';
import * as Config from '@oclif/config';
import * as appUtils from '../../src/utils/application';
import EnableCommand from '../../src/commands/forging/enable';
import DisableCommand from '../../src/commands/forging/disable';
import { getConfig } from '../utils/config';

describe('forging', () => {
	const actionResult = {
		address: 'actionAddress',
		forging: true,
	};
	const forgingStatus = {
		height: 1,
		maxHeightPrevoted: 1,
		maxHeightPreviouslyForged: 1,
	};

	let stdout: string[];
	let stderr: string[];
	let config: Config.IConfig;
	let invokeMock: jest.Mock;

	beforeEach(async () => {
		stdout = [];
		stderr = [];
		config = await getConfig();
		jest.spyOn(process.stdout, 'write').mockImplementation(val => stdout.push(val as string) > -1);
		jest.spyOn(process.stderr, 'write').mockImplementation(val => stderr.push(val as string) > -1);
		jest.spyOn(appUtils, 'isApplicationRunning').mockReturnValue(true);
		jest.spyOn(EnableCommand.prototype, 'printJSON').mockReturnValue();
		jest.spyOn(DisableCommand.prototype, 'printJSON').mockReturnValue();
		invokeMock = jest.fn();
		when(invokeMock)
			.calledWith('app:getForgingStatus')
			.mockResolvedValue([{ address: 'actionAddress', forging: true, ...forgingStatus }]);
		when(invokeMock)
			.calledWith('app:updateForgingStatus', expect.anything())
			.mockResolvedValue({ address: 'actionAddress', forging: true });
		jest.spyOn(apiClient, 'createIPCClient').mockResolvedValue({
			disconnect: jest.fn(),
			invoke: invokeMock,
		} as never);
		jest.spyOn(inquirer, 'prompt').mockResolvedValue({ password: 'promptPassword' });
	});

	describe('forging:enable', () => {
		it('should throw an error when arg is not provided', async () => {
			await expect(EnableCommand.run([], config)).rejects.toThrow('Missing 1 required arg');
		});

		it('should throw an error when height, maxHeightPreviouslyForged and maxHeightPrevoted arg is provided along with flag use-status-values', async () => {
			await expect(
				EnableCommand.run(
					['myAddress', '10', '10', '1', '--use-status-values', '--password=my-password'],
					config,
				),
			).rejects.toThrow(
				'Flag --use-status-values can not be used along with arguments height, maxHeightPreviouslyForged, maxHeightPrevoted',
			);
		});

		it('should throw an error when height, maxHeightPreviouslyForged and maxHeightPrevoted arg is less than zero', async () => {
			await expect(
				EnableCommand.run(['myAddress', '-10', '-10', '-1', '--password=my-password'], config),
			).rejects.toThrow(
				'The height, maxHeightPreviouslyForged and maxHeightPrevoted parameter value must be greater than or equal to 0',
			);
		});

		describe('when invoked with password', () => {
			it('should invoke action with given address and password', async () => {
				await EnableCommand.run(['myAddress', '10', '10', '1', '--password=my-password'], config);
				expect(invokeMock).toHaveBeenCalledWith('app:updateForgingStatus', {
					address: 'myAddress',
					forging: true,
					password: 'my-password',
					height: 10,
					maxHeightPreviouslyForged: 10,
					maxHeightPrevoted: 1,
					overwrite: false,
				});
			});

			it('should use 0 as default when forging for first time', async () => {
				const forgingData = { height: 0, maxHeightPrevoted: 0, maxHeightPreviouslyForged: 0 };
				when(invokeMock)
					.calledWith('app:getForgingStatus')
					.mockResolvedValue([{ address: 'actionAddress', forging: true, ...forgingData }]);
				await EnableCommand.run(
					['actionAddress', '--use-status-values', '--password=my-password'],
					config,
				);
				expect(EnableCommand.prototype.printJSON).toHaveBeenCalledWith(forgingData);
			});
		});

		describe('when invoked without password', () => {
			it('should prompt user for password', async () => {
				await EnableCommand.run(['myAddress', '10', '10', '1'], config);
				expect(inquirer.prompt).toHaveBeenCalledTimes(1);
				expect(inquirer.prompt).toHaveBeenCalledWith([
					{
						type: 'password',
						message: 'Enter password to decrypt the encrypted passphrase: ',
						name: 'password',
						mask: '*',
					},
				]);
			});

			it('should invoke action with given address and password', async () => {
				await EnableCommand.run(['myAddress', '10', '10', '1'], config);
				expect(invokeMock).toHaveBeenCalledWith('app:updateForgingStatus', {
					address: 'myAddress',
					forging: true,
					password: 'promptPassword',
					height: 10,
					maxHeightPreviouslyForged: 10,
					maxHeightPrevoted: 1,
					overwrite: false,
				});
			});
		});

		describe('when action is successful', () => {
			it('should invoke action with given address and user provided password', async () => {
				await EnableCommand.run(['myAddress', '10', '10', '1', '--password=my-password'], config);
				expect(EnableCommand.prototype.printJSON).toHaveBeenCalledTimes(1);
				expect(EnableCommand.prototype.printJSON).toHaveBeenCalledWith(actionResult);
			});
		});

		describe('when action fail', () => {
			it('should log the error returned', async () => {
				when(invokeMock)
					.calledWith('app:updateForgingStatus', {
						address: 'myFailedEnabledAddress',
						forging: true,
						password: 'my-password',
						height: 10,
						maxHeightPreviouslyForged: 10,
						maxHeightPrevoted: 1,
						overwrite: false,
					})
					.mockRejectedValue(new Error('Custom Error'));
				await expect(
					EnableCommand.run(
						['myFailedEnabledAddress', '10', '10', '1', '--password=my-password'],
						config,
					),
				).rejects.toThrow('Custom Error');
			});
		});

		describe('when invoked with overwrite', () => {
			it('should invoke action with given args and overwrite and password flags', async () => {
				await EnableCommand.run(
					['myAddress', '10', '10', '1', '--overwrite', '--password=my-password'],
					config,
				);
				expect(invokeMock).toHaveBeenCalledWith('app:updateForgingStatus', {
					address: 'myAddress',
					forging: true,
					password: 'my-password',
					height: 10,
					maxHeightPreviouslyForged: 10,
					maxHeightPrevoted: 1,
					overwrite: true,
				});
			});
		});
	});

	describe('forging:disable', () => {
		it('should throw an error when arg is not provided', async () => {
			await expect(DisableCommand.run([], config)).rejects.toThrow('Missing 1 required arg');
		});

		describe('when invoked with password', () => {
			it('should invoke action with given address and password', async () => {
				await DisableCommand.run(['myAddress', '--password=my-password'], config);
				expect(invokeMock).toHaveBeenCalledWith('app:updateForgingStatus', {
					address: 'myAddress',
					forging: false,
					password: 'my-password',
				});
			});
		});

		describe('when invoked without password', () => {
			it('should prompt user for password', async () => {
				await DisableCommand.run(['myAddress'], config);
				expect(inquirer.prompt).toHaveBeenCalledTimes(1);
				expect(inquirer.prompt).toHaveBeenCalledWith([
					{
						type: 'password',
						message: 'Enter password to decrypt the encrypted passphrase: ',
						name: 'password',
						mask: '*',
					},
				]);
			});

			it('should invoke action with given address and password', async () => {
				await DisableCommand.run(['myAddress'], config);
				expect(invokeMock).toHaveBeenCalledWith('app:updateForgingStatus', {
					address: 'myAddress',
					forging: false,
					password: 'promptPassword',
				});
			});
		});

		describe('when action is successful', () => {
			it('should invoke action with given address and user provided password', async () => {
				await DisableCommand.run(['myAddress', '--password=my-password'], config);
				expect(DisableCommand.prototype.printJSON).toHaveBeenCalledTimes(1);
				expect(DisableCommand.prototype.printJSON).toHaveBeenCalledWith(actionResult);
			});
		});

		describe('when action fail', () => {
			it('should log the error returned', async () => {
				when(invokeMock)
					.calledWith('app:updateForgingStatus', {
						address: 'myFailedDisabledAddress',
						forging: false,
						password: 'my-password',
					})
					.mockRejectedValue(new Error('Custom Error'));
				await expect(
					DisableCommand.run(['myFailedDisabledAddress', '--password=my-password'], config),
				).rejects.toThrow('Custom Error');
			});
		});
	});
});
