'use strict';

const { Contract } = require('fabric-contract-api');
const { v4: uuidv4 } = require('uuid');
const JRE = require('json-rules-engine');

const DOC_TYPE = "channelPolicy";

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

// Define the list of operators that can be used in the policy
const defaultOperatorList = [
    {name: 'equal'},
    {name: 'notEqual'},
    {name: 'in'},
    {name: 'notIn'},
    {name: 'contains'},
    {name: 'doesNotContain'},
    {name: 'lessThan'},
    {name: 'lessThanInclusive'},
    {name: 'greaterThan'},
    {name: 'greaterThanInclusive'}
]

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

    async createPaymentChannel(ctx, name) {
        const uuid = uuidv4();
        const channelId = `channel_${uuid}`;
        const channel = {
            docType: DOC_TYPE,
            channelId,
            name,
            policies: {},
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await ctx.stub.putState(channelId, Buffer.from(JSON.stringify(channel)));

        return channelId;
    }

    async fetchChannelData(ctx, uid) {
        const channel = await validateAndGetChannel(ctx, uid);
        return channel;
    }

    async upsertChannelPolicy(ctx, uid, policyName, operator, value) {
        const channel = await validateAndGetChannel(ctx, uid);

        if (!isOperatorValid(operator)) {
            throw new Error(`Operator ${operator} is not valid`);
        }

        // policyName is the attribute name
        if (!isAttributeValid(policyName)) {
            throw new Error(`Attribute ${policyName} is not valid`);
        }

        channel.policies[policyName] = {
            operator,
            value,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await ctx.stub.putState(uid, Buffer.from(JSON.stringify(channel)));
    }
}

module.exports = ChannelPolicyAssetTransfer;