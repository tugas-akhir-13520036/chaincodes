'use strict';

const { Contract } = require('fabric-contract-api');
const { Engine } = require('json-rules-engine');

const ATTR_STATUS = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
};

const MSP = {
    MERCHANT: 'Org1MSP',
    ATTRIBUTE_AUTHORITY: 'Org2MSP',
    PAYMENT_PROVIDER: 'Org3MSP'
}

const generateEngine = (channel) => {
    const engine = new Engine();

    const policies = channel.policies;
    const policyConditions = [];

    for (let key in policies) {
        if (policies.hasOwnProperty(key)) {
            const policy = policies[key];
            const condition = {
                fact: key,
                operator: policy.operator,
                value: policy.value
            };
            policyConditions.push(condition);
        }
    }

    engine.addRule({
        conditions: {
            all: policyConditions
        },
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

    _getCommonNameFromId(idString) {
        const match = idString.match(/CN=([^:]+)/);
        return match ? match[1] : null;
    }

    _mspValidation(ctx, mspList) {
        const msp = ctx.clientIdentity.getMSPID();
        const res = mspList.includes(msp);

        if (!res) {
            throw new Error(`Client is not authorized to perform this operation`);
        }

        return res;
    }

    async getDecision(ctx, channelId) {
        this._mspValidation(ctx, [MSP.MERCHANT]);

        const merchantRes = await ctx.stub.invokeChaincode('merchant-attr-asset-transfer', [Buffer.from('fetchOwnMerchantData')]);
        const channelRes = await ctx.stub.invokeChaincode('channel-policy-asset-transfer', [Buffer.from('fetchChannelData'), Buffer.from(channelId)]);

        if (merchantRes.status !== 200) {
            throw new Error(`Failed to fetch merchant data: ${merchantRes.message}`);
        }
        const merchant = JSON.parse(merchantRes.payload.toString());

        if (channelRes.status !== 200) {
            throw new Error(`Failed to fetch payment data: ${channelRes.message}`);
        }
        const channel = JSON.parse(channelRes.payload.toString());

        if (!channel.policies) return false;

        const fact = generateFact(merchant);
        const engine = generateEngine(channel);

        let result;
        try{
            result = await engine.run(fact);
        } catch (error) {
            console.error(`[ERROR] Failed to run the engine: ${error}`);
            return false;
        }

        return result.events.length > 0;
    }
}

module.exports = AccessDecisionAssetTransfer;