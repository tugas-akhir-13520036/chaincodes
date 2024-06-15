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

    async fetchOperatorList(ctx) {
        return defaultOperatorList;
    }

    async createPaymentChannel(ctx, name, uuid, date) {
        const channelId = `channel_${uuid}`;
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

    async fetchChannelData(ctx, uid) {
        const channel = await validateAndGetChannel(ctx, uid);
        return channel;
    }

    async upsertChannelPolicy(ctx, uid, policyName, value, operator, date) {
        const channel = await validateAndGetChannel(ctx, uid);
        console.log('VALUE upsertChannelPolicy', value)
        value = normalizeValue(value, policyName);
        console.log('VALUE upsertChannelPolicy', value)

        isOperatorValid(operator)
        isAttributeValid(policyName, value)

        channel.policies[policyName] = {
            operator,
            value,
            createdAt: date,
            updatedAt: date
        };

        await ctx.stub.putState(uid, Buffer.from(JSON.stringify(channel)));
    }
}

module.exports = ChannelPolicyAssetTransfer;