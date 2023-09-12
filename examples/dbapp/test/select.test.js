const store = require("../models/store");
// const { StoreHost } = require("../src/orm/StoreHost");
const assert = require( "assert" );

// store.setup( new StoreHost() );

// Initializes store with your knex db connection
// const knex = require( '../db/knex.js' );
// store.setup( new KdbStoreHost( knex ) );

describe( "Select", function () {
    const Customer = store.entity( 'Customer', (model) => {
        model.source( 'customer' );
        model.string( 'name' );
        model.label( 'name' );
        model.string( 'address' );
        model.string( 'reference' );
        model.number( 'telephone' );
        // model.storageData( dataStorage );
    } );
    it( "has an Entity", async function () {
        assert( Customer.metaData.name === 'Customer' );
        assert( Customer.metaData.model.fields );
        let rs = await Customer.select('*')
            .where( Customer.name.equals( 'Yadel' ) )
            .exec();
        assert( rs.length > 0 );
    });
});
