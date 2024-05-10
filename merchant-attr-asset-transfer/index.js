'use strict';

const { Contract } = require('fabric-contract-api');

class MerchantAttrAssetTransfer extends Contract {
    async initLedger(ctx) {
        console.info('Initialized the ledger');
    }
}

module.exports = MerchantAttrAssetTransfer;