


const KdbExpression = {

    
    composeAggregation( fieldAggregation ) {

        
        if ( fieldAggregation.type === 'sum' ) {
            fieldAggregation.toQuery = (kdbQuery) => {
                kdbQuery.qb.sum( fieldAggregation.field.sqlSource );
            }
        }

        return fieldAggregation;      
    },

    handle( field, kdbQuery ) {

        
        if (typeof field === 'object' && field instanceof FieldAggregation 
            && !(field instanceof FieldAggregationCount) 
            && !(field instanceof FieldAllMainTable) ) 
        {
            
            kdbQuery.qb.sum( /*.....*/);

            return this;
        }

    }
}


exports.KdbExpression = KdbExpression;
