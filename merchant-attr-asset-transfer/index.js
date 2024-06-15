'use strict';

const { Contract } = require('fabric-contract-api');

const { isAttributeValid } = require('./constant');

const DOC_TYPE = "merchantAttr";

const ATTR_STATUS = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
};

const validateAndGetMerchant = async (ctx, merchantId) => {
    const merchantAsBytes = await ctx.stub.getState(merchantId);
    if (!merchantAsBytes || merchantAsBytes.length === 0) {
        throw new Error(`Merchant with merchantId ${merchantId} does not exist`);
    }

    const merchant = JSON.parse(merchantAsBytes.toString());
    if (merchant.docType !== DOC_TYPE) {
        throw new Error(`Document type is not ${DOC_TYPE}`);
    }

    return merchant;
}

class MerchantAttrAssetTransfer extends Contract {
    async initLedger(ctx) {
        console.info('[INFO] Initialized the ledger for merchant attribute asset transfer');
    }

    async getAttributesList(ctx) {
        return attributeList;
    }

    async createMerchant(ctx, name, uuid, date) {
        const merchantId = `merchant_${uuid}`;
        const merchant = {
            docType: DOC_TYPE,
            merchantId,
            name,
            attributes: {},
            createdAt: date,
            updatedAt: date
        };

        await ctx.stub.putState(merchantId, Buffer.from(JSON.stringify(merchant)));

        return merchantId;
    }

    async fetchAllMerchantData(ctx) {
        const startKey = 'merchant_';
        const endKey = 'merchant_z';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];

        for await (const res of iterator) {
            const strValue = Buffer.from(res.value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: res.key, Record: record });
        }

        return allResults;
    }

    async fetchMerchantData(ctx, merchantId) {
        const merchant = await validateAndGetMerchant(ctx, merchantId);
        return merchant;
    }

    async proposeMerchantAttr(ctx, merchantId, attributeName, attributeValue, uuid, date) {
        const merchant = await validateAndGetMerchant(ctx, merchantId);

        if (!isAttributeValid(attributeName, attributeValue)) {
            throw new Error(`Attribute ${attributeName} is not valid`);
        }

        const idempotentKey = `attr_${uuid}`;
        const newAttribute = {
            idempotentKey: idempotentKey,
            value: attributeValue,
            status: ATTR_STATUS.PENDING,
            createdAt: date,
            updatedAt: date
        };

        merchant.attributes[attributeName] = newAttribute;

        await ctx.stub.putState(merchantId, Buffer.from(JSON.stringify(merchant)));
    }

    async fetchPendingMerchantAttr(ctx, merchantId) {
        const merchant = await validateAndGetMerchant(ctx, merchantId);

        const pendingAttributes = Object.keys(merchant.attributes).filter(attr => merchant.attributes[attr].status === ATTR_STATUS.PENDING);
        return pendingAttributes;
    }

    async activateMerchantAttr(ctx, merchantId, attributeName, date) {
        const merchant = await validateAndGetMerchant(ctx, merchantId);

        if (!merchant.attributes[attributeName]) {
            throw new Error(`Attribute ${attributeName} does not exist`);
        }

        merchant.attributes[attributeName].status = ATTR_STATUS.ACTIVE;
        merchant.attributes[attributeName].updatedAt = date;

        await ctx.stub.putState(merchantId, Buffer.from(JSON.stringify(merchant)));
    }
}

module.exports = MerchantAttrAssetTransfer;