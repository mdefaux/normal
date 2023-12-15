

class FieldAggregation {

    /**
     * 
     * @param {FieldQueryItem} field to aggregate
     * @param {String} type of aggreagtion
     */
    constructor(field, type) {
        this.field = field;
        this.type = type;

        /**TODO: call Host specific composeAggregation
         * 
         */
        /* ... compose( type ) */
        
        let host = field?.sourceEntity?.metaData?.host;
        if(host) host.composeAggregation(this);




        if ( this.type === 'sum' ) {
            this.sqlSource = () => {
                return `sum( ${field.sqlSource} )`;
            }
        }

    }
}

// exports.FieldAggregation = FieldAggregation;
class FieldAggregationMax extends FieldAggregation {
    constructor(field) {
        super(field);
    }

    toQuery(query) {
        query.qb.max(this.field.sqlSource);
    }
}

class FieldAggregationCount extends FieldAggregation {
    constructor() {
        super(undefined);
    }


}

class FieldAllMainTable extends FieldAggregation {
    constructor() {
        super(undefined);
    }


}

exports.FieldAggregation = FieldAggregation;
exports.FieldAggregationMax = FieldAggregationMax;
exports.FieldAggregationCount = FieldAggregationCount;
exports.FieldAllMainTable = FieldAllMainTable;
