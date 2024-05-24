const { ATTR_STATUS } = require('./constant');

class ChannelPolicyModel {
    constructor(uid, name, policies) {
        this.docType = 'channelPolicy';
        this.channelId = uid;
        this.name = name;
        this.policies = {};
        this.createdAt = new Date();
        this.updatedAt = new Date();

        for (let key in policies) {
            if (policies.hasOwnProperty(key)) {
                this.policies[key] = {
                    value: policies[key],
                    status: ATTR_STATUS.PENDING,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            }
        }
    }

    getJSON() {
        return {
            docType: this.docType,
            channelId: this.channelId,
            name: this.name,
            policies: this.policies,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }
}

module.exports = ChannelPolicyModel;