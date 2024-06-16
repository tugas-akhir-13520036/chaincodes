'use strict';

const { Contract } = require('fabric-contract-api');

const { attributeList, isAttributeValid, normalizeValue } = require('./constant');

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

    _getCommonNameFromId(idString) {
        const match = idString.match(/CN=([^:]+)/);
        return match ? match[1] : null;
    }

    async getAttributesList(ctx) {
        return attributeList;
    }

    async createMerchant(ctx, name, merchantId, date) {
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
        let res = await iterator.next();

        while(!res.done) {
            if (res.value) {
                console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
                const obj = JSON.parse(res.value.value.toString('utf8'));
                allResults.push(obj);
            }
            res = await iterator.next();
        }

        return allResults;
    }

    async fetchMerchantData(ctx, merchantId) {
        const merchant = await validateAndGetMerchant(ctx, merchantId);
        return merchant;
    }

    async proposeMerchantAttr(ctx, attributeName, attributeValue, uuid, date) {
        const merchantId = this._getCommonNameFromId(ctx.clientIdentity.getID());
        const merchant = await validateAndGetMerchant(ctx, merchantId);
        attributeValue = normalizeValue(attributeValue, attributeName);

        if (!isAttributeValid(attributeName, attributeValue)) {
            throw new Error(`Attribute ${attributeName} is not valid`);
        }

        const idempotentKey = `attr_${uuid}`;
        const newAttribute = {
            idempotentKey: idempotentKey,
            value: attributeValue,
            status: ATTR_STATUS.PENDING,
            createdAt: date,
            updatedAt: date,
            updatedBy: merchantId,
        };

        merchant.attributes[attributeName] = newAttribute;
        merchant.updatedAt = date;
        merchant.updatedBy = merchantId;

        await ctx.stub.putState(merchantId, Buffer.from(JSON.stringify(merchant)));
    }

    async fetchPendingMerchantAttr(ctx, merchantId) {
        const merchant = await validateAndGetMerchant(ctx, merchantId);

        const pendingAttributes = Object.keys(merchant.attributes).filter(attr => merchant.attributes[attr].status === ATTR_STATUS.PENDING);

        const result = {};
        pendingAttributes.forEach(attr => {
            result[attr] = merchant.attributes[attr];
        });

        return result;
    }

    async activateMerchantAttr(ctx, merchantId, attributeName, date) {
        const merchant = await validateAndGetMerchant(ctx, merchantId);

        if (!merchant.attributes[attributeName]) {
            throw new Error(`Attribute ${attributeName} does not exist`);
        }

        const userId = this._getCommonNameFromId(ctx.clientIdentity.getID());

        merchant.attributes[attributeName].status = ATTR_STATUS.ACTIVE;
        merchant.attributes[attributeName].updatedAt = date;
        merchant.attributes[attributeName].updatedBy = userId;
        merchant.updatedAt = date;
        merchant.updatedBy = userId;

        await ctx.stub.putState(merchantId, Buffer.from(JSON.stringify(merchant)));
    }

    async deactivateMerchantAttr(ctx, merchantId, attributeName, date) {
        const merchant = await validateAndGetMerchant(ctx, merchantId);

        if (!merchant.attributes[attributeName]) {
            throw new Error(`Attribute ${attributeName} does not exist`);
        }

        const userId = this._getCommonNameFromId(ctx.clientIdentity.getID());

        merchant.attributes[attributeName].status = ATTR_STATUS.INACTIVE;
        merchant.attributes[attributeName].updatedAt = date;
        merchant.attributes[attributeName].updatedBy = userId;
        merchant.updatedAt = date;
        merchant.updatedBy = userId;

        await ctx.stub.putState(merchantId, Buffer.from(JSON.stringify(merchant)));
    }

    async fetchPaymentChannels(ctx) {
        const response = await ctx.stub.invokeChaincode('channel-policy-asset-transfer', [Buffer.from('fetchAllPaymentChannelData')]);
        if (response.status !== 200) {
            throw new Error(`Failed to fetch payment channels: ${response.message}`);
        }
        const channels = JSON.parse(response.payload.toString());

        return channels;
    }

    async queryHistory(ctx, uid) {
        let iterator = await ctx.stub.getHistoryForKey(uid);
        let result = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value) {
                console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
                const obj = JSON.parse(res.value.value.toString('utf8'));
                result.push(obj);
            }
            res = await iterator.next();
        }
        await iterator.close();
        return result; 
    }

    async getMspId(ctx) {
        return ctx.clientIdentity.getMSPID();
    }
}

module.exports = MerchantAttrAssetTransfer;