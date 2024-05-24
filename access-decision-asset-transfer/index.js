'use strict';

const { Contract } = require('fabric-contract-api');

class AccessDecisionAssetTransfer extends Contract {
    async initLedger(ctx) {
        console.info('Initialized the ledger');
    }

    async fetchAllEligibleChannel(ctx, merchantId) {
        console.info('Fetching all eligible channel');
    }

    async fetchAllEligibleMerchant(ctx, channelId) {
        console.info('Fetching all eligible merchant');
    }

    async getDecision(ctx, merchantId, channelId) {
        console.info('Getting decision');
    }
}

module.exports = ChannelPolicyAssetTransfer;