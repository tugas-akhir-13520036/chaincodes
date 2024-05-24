'use strict';

const { Contract } = require('fabric-contract-api');

class MerchantAttrAssetTransfer extends Contract {
    async initLedger(ctx) {
        console.info('Initialized the ledger');
    }

    async createMerchant(ctx, uid, name) {
        console.info('Creating merchant attr');
    }

    async fetchMerchantData(ctx, uid) {
        console.info('Fetching merchant data');
    }

    async fetchPendingMerchantAttr(ctx) {
        console.info('Fetching pending merchant attr');
    }

    async proposeMerchantAttr(ctx, uid, attributes) {
        console.info('Proposing merchant attr');
    }

    async activateMerchantAttr(ctx, uid) {
        console.info('Activating merchant attr');
    }
}

module.exports = MerchantAttrAssetTransfer;