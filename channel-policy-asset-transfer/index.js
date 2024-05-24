'use strict';

const { Contract } = require('fabric-contract-api');

class ChannelPolicyAssetTransfer extends Contract {
    async initLedger(ctx) {
        console.info('Initialized the ledger');
    }

    async createPaymentChannel(ctx, uid, name) {
        console.info('Creating payment channel');
    }

    async fetchChannelData(ctx, uid) {
        console.info('Fetching channel data');
    }

    async upsertChannelPolicy(ctx, uid, policy) {
        console.info('Upserting channel policy');
    }
}

module.exports = ChannelPolicyAssetTransfer;