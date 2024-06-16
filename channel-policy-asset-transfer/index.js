'use strict';

const { Contract } = require('fabric-contract-api');
const { defaultOperatorList, normalizeValue, isAttributeValid, isOperatorValid } = require('./constant');

const DOC_TYPE = "channelPolicy";

const validateAndGetChannel = async (ctx, channelId) => {
    const channelAsBytes = await ctx.stub.getState(channelId);
    if (!channelAsBytes || channelAsBytes.length === 0) {
        throw new Error(`Channel with channelId ${channelId} does not exist`);
    }

    const channel = JSON.parse(channelAsBytes.toString());
    if (channel.docType !== DOC_TYPE) {
        throw new Error(`Document type is not ${DOC_TYPE}`);
    }

    return channel;
}

class ChannelPolicyAssetTransfer extends Contract {
    async initLedger(ctx) {
        console.info('[INFO] Initialized the ledger for channel policy asset transfer');
    }

    _getCommonNameFromId(idString) {
        const match = idString.match(/CN=([^:]+)/);
        return match ? match[1] : null;
    }

    async fetchOperatorList(ctx) {
        return defaultOperatorList;
    }

    async createPaymentChannel(ctx, name, channelId, date) {
        const channel = {
            docType: DOC_TYPE,
            channelId,
            name,
            policies: {},
            createdAt: date,
            updatedAt: date
        };

        await ctx.stub.putState(channelId, Buffer.from(JSON.stringify(channel)));

        return channelId;
    }

    async fetchAllPaymentChannelData(ctx) {
        const startKey = 'payment_provider_';
        const endKey = 'payment_provider_z';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value) {
                console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
                const obj = JSON.parse(res.value.value.toString('utf8'));
                allResults.push(obj);
            }
            res = await iterator.next();
        }
        await iterator.close();
        return allResults;
    }

    async fetchChannelData(ctx, uid) {
        const channel = await validateAndGetChannel(ctx, uid);
        return channel;
    }

    async upsertChannelPolicy(ctx, uid, policyName, value, operator, date) {
        const channel = await validateAndGetChannel(ctx, uid);
        value = normalizeValue(value, policyName);

        isOperatorValid(operator, policyName, value)
        isAttributeValid(policyName, value)

        const userId = this._getCommonNameFromId(ctx.clientIdentity.getID());

        channel.policies[policyName] = {
            operator,
            value,
            createdAt: date,
            updatedAt: date,
            updatedBy: userId
        };
        channel.updatedAt = date;
        channel.updatedBy = userId;

        await ctx.stub.putState(uid, Buffer.from(JSON.stringify(channel)));
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
}

module.exports = ChannelPolicyAssetTransfer;