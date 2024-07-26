
const { StoreHost } = require('../StoreHost');
const { KdbInsert } = require('./KdbInsert');
const { KdbQuery } = require('./KdbQuery');
const { KdbUpdate } = require('./KdbUpdate');
const { KdbDelete } = require('./KdbDelete');
const { KdbExpression } = require('./KdbExpression');

class KdbStoreHost extends StoreHost 
{
    constructor( knex )
    {
        super();
        this.knex = knex;
    }

    createQuery( entity ) {
        return new KdbQuery( entity, this.knex );
    }

    createInsert( entity ) {
        return new KdbInsert( entity, this.knex );
    }

    createUpdate( entity ) {
        return new KdbUpdate( entity, this.knex );
    }

    createDelete( entity ) {
        return new KdbDelete( entity, this.knex );
    }

    /**Composes an aggregation expression
     * 
     * @param {fieldAggregation} the aggreagtion on column to compose 
     * @returns FieldAggregation
     */
     composeAggregation( fieldAggregation ) {
        return KdbExpression.composeAggregation( fieldAggregation );
    }

    async transaction( callback ) {
        return await this.knex.transaction( callback );
    }
}

exports.KdbStoreHost = KdbStoreHost;
