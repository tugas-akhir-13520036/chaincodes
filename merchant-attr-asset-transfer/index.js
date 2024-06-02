'use strict';

const { Contract } = require('fabric-contract-api');
const { v4: uuidv4 } = require('uuid');

const DOC_TYPE = "merchantAttr";

// Define the list of attribute statuses
const ATTR_STATUS = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
};

// Define the list of attribute types
const ATTR_TYPE = {
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE',
};

// Define the list of attributes that can be stored for a merchant
const attributeList = [
    { name: 'name', type: ATTR_TYPE.STRING },
    { name: 'email', type: ATTR_TYPE.STRING },
    { name: 'phone', type: ATTR_TYPE.STRING },
    { name: 'description', type: ATTR_TYPE.STRING },
    { name: 'address', type: ATTR_TYPE.STRING },
    { name: 'city', type: ATTR_TYPE.STRING },
    { name: 'state', type: ATTR_TYPE.STRING },
    { name: 'country', type: ATTR_TYPE.STRING }, // e.g. US, UK, etc.
    { name: 'category', type: ATTR_TYPE.STRING }, // e.g. restaurant, retail, etc.
    { name: 'businessType', type: ATTR_TYPE.STRING }, // e.g. B2B, B2C, etc.
    { name: 'businessModel', type: ATTR_TYPE.STRING }, // e.g. marketplace, aggregator, etc.
    { name: 'timezone', type: ATTR_TYPE.STRING }, // e.g. UTC, GMT, etc.
    { name: 'currency', type: ATTR_TYPE.STRING }, // e.g. USD, EUR, etc.
    { name: 'created_year', type: ATTR_TYPE.NUMBER },
    { name: 'created_month', type: ATTR_TYPE.NUMBER },
    { name: 'total_payment_volume', type: ATTR_TYPE.NUMBER },
    { name: 'total_payment_count', type: ATTR_TYPE.NUMBER },
    { name: 'total_revenue', type: ATTR_TYPE.NUMBER },
]

const isAttributeValid = (attribute) => {
    return attributeList.some(attr => attr.name === attribute);
}

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

    async createMerchant(ctx, name) {
        const uuid = uuidv4();
        const merchantId = `merchant_${uuid}`;
        const merchant = {
            docType: DOC_TYPE,
            merchantId,
            name,
            attributes: {},
            createdAt: new Date(),
            updatedAt: new Date()
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

    async proposeMerchantAttr(ctx, merchantId, attributeName, attributeValue) {
        const merchant = await validateAndGetMerchant(ctx, merchantId);

        if (!isAttributeValid(attributeName)) {
            throw new Error(`Attribute ${attributeName} is not valid`);
        }

        const attrId = uuidv4();
        const idempotentKey = `attr_${attrId}`;
        const newAttribute = {
            idempotentKey: idempotentKey,
            value: attributeValue,
            status: ATTR_STATUS.PENDING,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        merchant.attributes[attributeName] = newAttribute;

        await ctx.stub.putState(merchantId, Buffer.from(JSON.stringify(merchant)));
    }

    async fetchPendingMerchantAttr(ctx, merchantId) {
        const merchant = await validateAndGetMerchant(ctx, merchantId);

        const pendingAttributes = Object.keys(merchant.attributes).filter(attr => merchant.attributes[attr].status === ATTR_STATUS.PENDING);
        return pendingAttributes;
    }

    async activateMerchantAttr(ctx, merchantId, attributeName) {
        const merchant = await validateAndGetMerchant(ctx, merchantId);

        if (!merchant.attributes[attributeName]) {
            throw new Error(`Attribute ${attributeName} does not exist`);
        }

        merchant.attributes[attributeName].status = ATTR_STATUS.ACTIVE;
        merchant.attributes[attributeName].updatedAt = new Date();

        await ctx.stub.putState(merchantId, Buffer.from(JSON.stringify(merchant)));
    }
}

module.exports = MerchantAttrAssetTransfer;