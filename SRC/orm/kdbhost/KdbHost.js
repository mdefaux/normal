
const { StoreHost } = require('../StoreHost');
const { KdbInsert } = require('./KdbInsert');
const { KdbQuery } = require('./KdbQuery');
const { KdbUpdate } = require('./KdbUpdate');

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
        return undefined;
    }

}

exports.KdbStoreHost = KdbStoreHost;
