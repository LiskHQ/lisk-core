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
const { P2P, events } = require('@liskhq/lisk-p2p');
const { cryptography } = require('lisk-sdk');

const genesisBlock = require('../../src/config/alphanet/genesis_block.json');

const networkIdentifier = cryptography.getNetworkIdentifier(Buffer.from(genesisBlock.header.id, 'base64'), 'Lisk');

const customNodeInfoSchema = {
	$id: '/nodeInfo/custom',
	type: 'object',
	properties: {
		height: {
			dataType: 'uint32',
			fieldNumber: 1,
		},
		maxHeightPrevoted: {
			dataType: 'uint32',
			fieldNumber: 2,
		},
		blockVersion: {
			dataType: 'uint32',
			fieldNumber: 3,
		},
		lastBlockID: {
			dataType: 'bytes',
			fieldNumber: 4,
		},
	},
}

const getP2PClient = (ip, port) => {
	const p2p = new P2P({
		nodeInfo: {
			networkId: networkIdentifier.toString('hex'),
			nonce: cryptography.getRandomBytes(16).toString('hex'),
			networkVersion: '2.0',
			options: {
				lastBlockID: Buffer.alloc(0),
				blockVersion: 0,
				height: 0,
				maxHeightPrevoted: 0,
			},
		},
		// Port is specified but maxInboundConnects is 0, so there is no server
		port: 3333,
		maxInboundConnections: 0,
		// customNodeInfoSchema,
		seedPeers: [{
			ipAddress: ip,
			port: port,
		}],
	});
	p2p.on(events.EVENT_CONNECT_OUTBOUND, console.log)
	p2p.on(events.EVENT_CLOSE_OUTBOUND, console.error)
	p2p.on(events.EVENT_FAILED_TO_COLLECT_PEER_DETAILS_ON_CONNECT, console.error)
	p2p.on(events.EVENT_MESSAGE_RECEIVED, console.log)
	p2p.on(events.EVENT_REQUEST_RECEIVED, console.log)
	return p2p;
}

module.exports = {
	getP2PClient,
	networkIdentifier,
}
