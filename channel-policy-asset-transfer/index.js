'use strict';

const { Contract } = require('fabric-contract-api');
const { attributeList, defaultOperatorList } = require('./constant');
const JRE = require('json-rules-engine');

const DOC_TYPE = "channelPolicy";

const isAttributeValid = (key, value) => {
    const attribute = attributeList.find(attr => attr.name === key);
    if (!attribute) return false;

    if (!attribute.validationFunc(value)) return false;

    return true;
}

const isOperatorValid = (operator) => {
    return defaultOperatorList.some(op => op.name === operator);
}

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

        if (!isOperatorValid(operator)) {
            throw new Error(`Operator ${operator} is not valid`);
        }

        // policyName is the attribute name
        if (!isAttributeValid(policyName, value)) {
            throw new Error(`Attribute ${policyName} is not valid`);
        }

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