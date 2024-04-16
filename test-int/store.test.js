const defs = require("../src/ForteORM");
const { StoreHost } = require("../src/orm/StoreHost");
const assert = require( "assert" );

defs.setup( new StoreHost() );

// Initializes store with your knex db connection
// const knex = require( '../db/knex.js' );
// store.setup( new KdbStoreHost( knex ) );

describe( "Store", function () {
    describe( "empty", function () {
        it( "has a main host instance of StoreHost", function () {
            assert( defs.mainHost instanceof StoreHost );
        });
    });

    describe( "with an entity", function () {
        const Customer = defs.entity( 'Customer', (model) => {

            model.source( 'customer' );
        
            model.label( 'name' );
        
            model.string( 'name' );
            model.string( 'address' );
            model.string( 'reference' );
            model.number( 'telephone' );
        
            // model.storageData( dataStorage );
        } );
        it( "has an Entity", function () {
            assert( Customer.metaData.name === 'Customer' );
            assert( Customer.metaData.model.fields );
        });
    });
});
