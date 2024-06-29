'use strict';

const { Contract } = require('fabric-contract-api');
const { MSP, defaultOperatorList, normalizeValue, isAttributeValid, isOperatorValid } = require('./constant');

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

    _mspValidation(ctx, mspList) {
        const msp = ctx.clientIdentity.getMSPID();
        const res = mspList.includes(msp);

        if (!res) {
            throw new Error(`Client is not authorized to perform this operation`);
        }

        return res;
    }

    async fetchOperatorList(ctx) {
        return defaultOperatorList;
    }

    async createPaymentChannel(ctx, name, channelId, date) {
        this._mspValidation(ctx, [MSP.PAYMENT_PROVIDER]);
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
        this._mspValidation(ctx, [MSP.ATTRIBUTE_AUTHORITY]);
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

    async fetchAllPaymentChannelDataByMerchant(ctx) {
        this._mspValidation(ctx, [MSP.MERCHANT]);
        const startKey = 'payment_provider_';
        const endKey = 'payment_provider_z';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value) {
                console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
                const obj = JSON.parse(res.value.value.toString('utf8'));
                delete obj.policies;
                allResults.push(obj);
            }
            res = await iterator.next();
        }
        await iterator.close();
        return allResults;
    }

    async fetchOwnChannelData(ctx) {
        this._mspValidation(ctx, [MSP.PAYMENT_PROVIDER]);
        const uid = this._getCommonNameFromId(ctx.clientIdentity.getID());
        const channel = await validateAndGetChannel(ctx, uid);
        return channel;
    }

    async fetchChannelData(ctx, uid) {
        this._mspValidation(ctx, [MSP.ATTRIBUTE_AUTHORITY, MSP.MERCHANT]);
        const channel = await validateAndGetChannel(ctx, uid);
        return channel;
    }

    async upsertChannelPolicy(ctx, policyName, value, operator, date) {
        this._mspValidation(ctx, [MSP.PAYMENT_PROVIDER]);
        const uid = this._getCommonNameFromId(ctx.clientIdentity.getID());
        const channel = await validateAndGetChannel(ctx, uid);
        value = normalizeValue(value, policyName);

        isOperatorValid(operator, policyName, value)
        isAttributeValid(policyName, value)

        channel.policies[policyName] = {
            operator,
            value,
            createdAt: date,
            updatedAt: date,
            updatedBy: uid
        };
        channel.updatedAt = date;
        channel.updatedBy = uid;

        await ctx.stub.putState(uid, Buffer.from(JSON.stringify(channel)));
    }

    async deleteChannelPolicy(ctx, policyName, date) {
        this._mspValidation(ctx, [MSP.PAYMENT_PROVIDER]);
        const uid = this._getCommonNameFromId(ctx.clientIdentity.getID());
        const channel = await validateAndGetChannel(ctx, uid);

        if (channel.policies[policyName]) {
            delete channel.policies[policyName];
            channel.updatedAt = date;
            channel.updatedBy = this._getCommonNameFromId(ctx.clientIdentity.getID());
            await ctx.stub.putState(uid, Buffer.from(JSON.stringify(channel)));
        }
    }

    async queryOwnHistory(ctx) {
        this._mspValidation(ctx, [MSP.PAYMENT_PROVIDER]);
        const uid = this._getCommonNameFromId(ctx.clientIdentity.getID());
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

    async queryHistory(ctx, uid) {
        this._mspValidation(ctx, [MSP.ATTRIBUTE_AUTHORITY]);
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