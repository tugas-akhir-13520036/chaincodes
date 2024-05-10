'use strict';

const { Contract } = require('fabric-contract-api');

class ChannelPolicyAssetTransfer extends Contract {
    async initLedger(ctx) {
        console.info('Initialized the ledger');
    }
}

module.exports = ChannelPolicyAssetTransfer;