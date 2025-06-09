const {Vendor,Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );


describe( "Select by", function () {
    it( "query Partnumber byId", async function () {
        let rs = await Partnumber.select('*')
            .byId( 1 );
        assert( !Array.isArray( rs ) );
        assert( rs.vendor_foreign.id === 1 );
        assert( !rs.vendor_foreign.name ); // not getting label of objectLinks; object with id only {id: 1}
    });
    it( "query Partnumber with where condition (id.equals)", async function () {
        let rs = await Partnumber.select('*')
            .where( Partnumber.id.equals( 1 ) )
            .exec();
        assert( Array.isArray( rs ) );
        assert( rs.length === 1 );
        assert( rs[0].vendor_foreign.id === 1 );
        assert( !rs[0].vendor_foreign.name );
    });
    it( "query Partnumber with a filter", async function () {
        let rs = await Partnumber.select('*')
            .where( Partnumber.part_number.equals( 'DM4004' ) )
            .exec();
        assert( Array.isArray( rs ) );
        assert( rs.length === 1 );
        assert( rs[0].id === 4);
        assert( rs[0].vendor_foreign.id === 1 );
        assert( !rs[0].vendor_foreign.name );
    });
    it( "query all objectLookups (Vendor)", async function () {
        // record set
        let query = Partnumber.select( Partnumber.vendor_foreign );
            // .where( Customer.name.equals( 'Yadel' ) )
        
        assert( query.relateds );
        assert( query.relateds.vendor_foreign );
        assert( query.columns );
        assert( query.columns.length > 0 );
        assert( query.columns[0] );
        assert( query.columns[0].field.name === 'vendor_foreign' );
        assert( query.columns[0].foreignTableAlias === '_jt_VENDOR_vendor_foreign' );
        assert( query.columns[0].idFieldKey === 'vendor_id' );
        // assert( rs.relateds.Vendor === rs.columns[1] );
        let rs = await query.exec();
        assert( rs.length === 5 );
        assert( rs[0].vendor_foreign.name === 'VendorX' );
    });
});
