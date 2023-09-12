const store = require("../models/store");
// const { StoreHost } = require("../src/orm/StoreHost");
const assert = require( "assert" );

// store.setup( new StoreHost() );

// Initializes store with your knex db connection
// const knex = require( '../db/knex.js' );
// store.setup( new KdbStoreHost( knex ) );

describe( "Join related", function () {
    const Vendor = store.entity( 'Vendor', (model) => {
        model.source( 'vendor' );
        model.string( 'name' );
        model.label( 'name' );
    } );
    const Partnumber = store.entity( 'Partnumber', (model) => {
        model.source( 'partnumber' );
        model.string( 'name' );
        model.label( 'name' );
        model.objectLink( Vendor ).source( 'vendor_id' );
    } );
    it( "query Partnumber", async function () {
        assert( Partnumber.metaData.name === 'Partnumber' );
        assert( Partnumber.metaData.model.fields );
        let rs = await Partnumber.select('*')
            .joinAllRelated()
            // .where( Customer.name.equals( 'Yadel' ) )
            .exec();
        assert( rs.length > 0 );
        assert( rs[0].Vendor.name === 'VendorX' );
    });
    const Device = store.entity( 'Device', (model) => {
        model.source( 'device' );
        model.string( 'serialnumber' );
        model.label( 'serialnumber' );
        model.objectLink( Partnumber ).source( 'partnumber_id' );
    } );
    it( "query Device getting vendor", async function () {
        
        let rs = await Device.select('*')
            .select( 'Partnumber.Vendor' )
            // .select( Partnumber.Vendor )
            // .select( Device.Partnumber.Vendor )
            // .joinAllRelated()
            // .where( Customer.name.equals( 'Yadel' ) )
            .exec();
        assert( rs.length > 0 );
        assert( rs[0].Partnumber );
        assert( rs[0].Partnumber.Vendor );
        assert( rs[0].Partnumber.Vendor === 'VendorX' );
        // assert( rs[0].Partnumber.Vendor.name === 'VendorX' );
    });
});
