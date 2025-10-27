

class StoreHost {

    createQuery( entity ) {
        return undefined;
    }

    createInsert( entity ) {
        return undefined;
    }

    createUpdate( entity) {
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
