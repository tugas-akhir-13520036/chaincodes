// Define the list of attributes that can be stored for a merchant
const attributeList = [
    { 
        name: 'name',
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            return true;
        }
    },
    { 
        name: 'email', 
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            if (!value.match(/\S+@\S+\.\S+/)) return false;
            return true;
        }
    },
    { 
        name: 'phone',
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            if (!value.match(/^\d{10}$/)) return false;
            return true;
        }
    },
    { 
        name: 'description', 
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            return true;
        }
    },
    { 
        name: 'address', 
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            return true;
        } 
    },
    { 
        name: 'city', 
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            return true;
        }
    },
    { 
        name: 'state',
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            return true;
        }
    },
    { 
        name: 'country',
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            if (!value.match(/^[A-Z]{2}$/)) return false;
            return true;
        }
    }, // e.g. US, UK, etc.
    {
        name: 'category',
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            return true;
        }
     }, // e.g. restaurant, retail, etc.
    { 
        name: 'businessType', 
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            return true;
        } 
    }, // e.g. B2B, B2C, etc.
    { 
        name: 'businessModel', 
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            return true;
        } 
    },
    { 
        name: 'currency', 
        validationFunc: (value) => {
            if (typeof value !== 'string') return false;
            if (!value.match(/^[A-Z]{3}$/)) return false;
            return true;
        }
    }, // e.g. USD, EUR, etc.
    { 
        name: 'created_year', 
        validationFunc: (value) => {
            if (typeof value !== 'number') return false;
            if (value > new Date().getFullYear()) return false;
            return true;
        }
    },
    { 
        name: 'created_month', 
        validationFunc: (value) => {
            if (typeof value !== 'number') return false;
            if (value < 1 || value > 12) return false;
            return true;
        } 
    },
    { 
        name: 'total_payment_volume',
        validationFunc: (value) => {
            if (typeof value !== 'number') return false;
            return true;
        } 
    },
    { 
        name: 'total_payment_count', 
        validationFunc: (value) => {
            if (typeof value !== 'number') return false;
            return true;
        } 
    },
    { 
        name: 'total_revenue', 
        validationFunc: (value) => {
            if (typeof value !== 'number') return false;
            return true;
        } 
    },
    { 
        name: 'is_corporate', 
        validationFunc: (value) => {
            if (typeof value !== 'boolean') return false;
            return true;
        } 
    },
    { 
        name: 'is_website_valid', 
        validationFunc: (value) => {
            if (typeof value !== 'boolean') return false;
            return true;
        } 
    },
]

// Define the list of operators that can be used in the policy
const defaultOperatorList = [
    {
        name: 'equal',
        validationFunc: (value) => {
            return true;
        }
    },
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

module.exports = { attributeList, defaultOperatorList };