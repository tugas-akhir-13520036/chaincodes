const attrType = {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
}

const MSP = {
    MERCHANT: 'Org1MSP',
    ADMIN: 'Org2MSP',
    PAYMENT_PROVIDER: 'Org3MSP'
}

const convertToNumber = (value) => {
    try {
        return Number(value);
    } catch (error) {
        return null;
    }
}

const convertToBoolean = (value) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
}

const attributeList = [
    { 
        name: 'name',
        type: attrType.STRING,
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            return true;
        }
    },
    { 
        name: 'email', 
        type: attrType.STRING,
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            if (!value.match(/\S+@\S+\.\S+/)) return false;
            return true;
        }
    },
    { 
        name: 'phone',
        type: attrType.STRING,
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            if (!value.match(/^\d{10}$/)) return false;
            return true;
        }
    },
    { 
        name: 'description', 
        type: attrType.STRING,
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            return true;
        }
    },
    { 
        name: 'address', 
        type: attrType.STRING,
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            return true;
        } 
    },
    { 
        name: 'city',
        type: attrType.STRING,
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            return true;
        },
        policyOps: ['equal', 'notEqual', 'in', 'notIn']
    },
    { 
        name: 'state',
        type: attrType.STRING,
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            return true;
        },
        policyOps: ['equal', 'notEqual', 'in', 'notIn']
    },
    { 
        name: 'country',
        type: attrType.STRING,
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            if (!value.match(/^[A-Z]{2}$/)) return false;
            return true;
        },
        policyOps: ['equal', 'notEqual', 'in', 'notIn']
    }, // e.g. US, UK, etc.
    {
        name: 'category',
        type: attrType.STRING,
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            return true;
        },
        policyOps: ['equal', 'notEqual', 'in', 'notIn']
     }, // e.g. restaurant, retail, etc.
    { 
        name: 'businessType', 
        type: attrType.STRING,
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            return true;
        },
        policyOps: ['equal', 'notEqual', 'in', 'notIn']
    }, // e.g. B2B, B2C, etc.
    { 
        name: 'businessModel',
        type: attrType.STRING,
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            return true;
        },
        policyOps: ['equal', 'notEqual', 'in', 'notIn']
    }, // e.g. marketplace, aggregator, etc.
    { 
        name: 'currency',
        type: attrType.STRING,
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            if (!value.match(/^[A-Z]{3}$/)) return false;
            return true;
        },
        policyOps: ['equal', 'notEqual', 'in', 'notIn']
    }, // e.g. USD, EUR, etc.
    { 
        name: 'created_year',
        type: attrType.NUMBER,
        validationFunc: (value) => {
            if (!value || typeof value !== 'number') return false;
            if (value > new Date().getFullYear()) return false;
            return true;
        },
        policyOps: ['equal', 'notEqual', 'in', 'notIn', 'lessThan', 'lessThanInclusive', 'greaterThan', 'greaterThanInclusive']
    },
    { 
        name: 'created_month', 
        type: attrType.NUMBER,
        validationFunc: (value) => {
            if (!value || typeof value !== 'number') return false;
            if (value < 1 || value > 12) return false;
            return true;
        },
        policyOps: ['equal', 'notEqual', 'in', 'notIn', 'lessThan', 'lessThanInclusive', 'greaterThan', 'greaterThanInclusive']
    },
    { 
        name: 'total_payment_volume',
        type: attrType.NUMBER,
        validationFunc: (value) => {
            if (!value || typeof value !== 'number') return false;
            return true;
        },
        policyOps: ['equal', 'notEqual', 'lessThan', 'lessThanInclusive', 'greaterThan', 'greaterThanInclusive']
    },
    { 
        name: 'total_payment_count', 
        type: attrType.NUMBER,
        validationFunc: (value) => {
            if (!value || typeof value !== 'number') return false;
            return true;
        },
        policyOps: ['equal', 'notEqual', 'lessThan', 'lessThanInclusive', 'greaterThan', 'greaterThanInclusive']
    },
    { 
        name: 'total_revenue', 
        type: attrType.NUMBER,
        validationFunc: (value) => {
            if (!value || typeof value !== 'number') return false;
            return true;
        },
        policyOps: ['equal', 'notEqual', 'lessThan', 'lessThanInclusive', 'greaterThan', 'greaterThanInclusive']
    },
    { 
        name: 'is_corporate', 
        type: attrType.BOOLEAN,
        validationFunc: (value) => {
            if (!value || typeof value !== 'boolean') return false;
            return true;
        },
        policyOps: ['equal', 'notEqual']
    },
    { 
        name: 'is_website_valid',
        type: attrType.BOOLEAN,
        validationFunc: (value) => {
            if (!value || typeof value !== 'boolean') return false;
            return true;
        },
        policyOps: ['equal', 'notEqual']
    },
]

const normalizeValue = (value, attrName) => {
    if (value === undefined || value === null) return null;
    const attribute = attributeList.find(attr => attr.name === attrName);
    if (!attribute) return null;

    if (attribute.type === attrType.NUMBER) {
        return convertToNumber(value);
    } else if (attribute.type === attrType.BOOLEAN) {
        return convertToBoolean(value);
    } else {
        return value;
    }
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

const isAttributeValid = (key, value) => {
    const attribute = attributeList.find(attr => attr.name === key);
    if (!attribute) throw new Error(`Attribute ${key} is not valid`);

    if (!attribute.validationFunc(value)) throw new Error(`Value ${value} is not valid for attribute ${key}`);

    return true;
}

const isOperatorValid = (operator, key, value) => {
    const flag = defaultOperatorList.some(op => op.name === operator);
    if (!flag) throw new Error(`Operator ${operator} is not valid`);

    if (value === undefined || value === null) {
        if (operator === 'equal') throw new Error(`Operator ${operator} is not valid for null value`);
        if (operator === 'notEqual') throw new Error(`Operator ${operator} is not valid for null value`);
    }

    const attribute = attributeList.find(attr => attr.name === key);
    if (!attribute) throw new Error(`Attribute ${key} is not valid`);

    const policyOps = attribute.policyOps;
    if (!policyOps) return true;

    if (!policyOps.includes(operator)) throw new Error(`Operator ${operator} is not valid for attribute ${key}`);

    return true;
}

module.exports = { 
    attributeList, 
    MSP,
    defaultOperatorList, 
    normalizeValue,
    isAttributeValid,
    isOperatorValid
};