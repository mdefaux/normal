

class StoreHost {

    createQuery() {
        return undefined;
    }

    createInsert() {
        return undefined;
    }

    createUpdate() {
        return undefined;
    }


    /**Composes an aggregation expression
     * 
     * @param {fieldAggregation} the aggreagtion on column to compose 
     * @returns FieldAggregation
     */
    composeAggregation( fieldAggregation ) {
        return undefined;
    }
}

exports.StoreHost = StoreHost;
