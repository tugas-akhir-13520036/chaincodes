'use strict';

const { Contract } = require('fabric-contract-api');
const { Engine } = require('json-rules-engine');

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

    const DOC_TYPE = "merchantAttr";
    const merchant = JSON.parse(merchantAsBytes.toString());
    if (merchant.docType !== DOC_TYPE) {
        throw new Error(`Document type is not ${DOC_TYPE}`);
    }

    return merchant;
}

const validateAndGetChannel = async (ctx, channelId) => {
    const channelAsBytes = await ctx.stub.getState(channelId);
    if (!channelAsBytes || channelAsBytes.length === 0) {
        throw new Error(`Channel with channelId ${channelId} does not exist`);
    }

    const DOC_TYPE = "channelPolicy";
    const channel = JSON.parse(channelAsBytes.toString());
    if (channel.docType !== DOC_TYPE) {
        throw new Error(`Document type is not ${DOC_TYPE}`);
    }

    return channel;
}

const generateEngine = (channel) => {
    const engine = new Engine();

    const policies = channel.policies;
    const conditions = [];

    for (let key in policies) {
        if (policies.hasOwnProperty(key)) {
            const policy = policies[key];
            const condition = {
                fact: key,
                operator: policy.operator,
                value: policy.value
            };
            conditions.push(condition);
        }
    }

    engine.addRule({
        conditions,
        event: {
            type: 'decision',
            params: {
                channelId: channel.channelId
            }
        }
    });

    return engine;
}

const generateFact = (merchant) => {
    const attributes = merchant.attributes;
    const fact = {};

    for (let key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            const attribute = attributes[key];
            if (attribute.status === ATTR_STATUS.ACTIVE) fact[key] = attribute.value;
        }
    }

    return fact;
}

class AccessDecisionAssetTransfer extends Contract {
    async initLedger(ctx) {
        console.info('[INFO] Initialized the ledger for access decision asset transfer');
    }

    async getDecision(ctx, merchantId, channelId) {
        const merchant = await validateAndGetMerchant(ctx, merchantId);
        const channel = await validateAndGetChannel(ctx, channelId);

        const engine = generateEngine(channel);
        const fact = generateFact(merchant);

        const result = await engine.run(fact);
        return result.events.length > 0;
    }
}

module.exports = AccessDecisionAssetTransfer;