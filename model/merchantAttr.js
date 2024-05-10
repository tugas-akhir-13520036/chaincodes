const { ATTR_STATUS } = require('./constant');

class MerchantAttrModel {
    constructor(uid, name, attributes) {
        this.merchantId = uid;
        this.name = name;
        this.attributes = {};
        this.createdAt = new Date();
        this.updatedAt = new Date();

        for (let key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                this.attributes[key] = {
                    value: attributes[key],
                    status: ATTR_STATUS.PENDING,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            }
        }
    }
}

module.exports = MerchantAttrModel;