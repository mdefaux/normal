const {Vendor,Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );


describe( "Select by", function () {
    it( "query Partnumber by Id", async function () {
        let rs = await Partnumber.select('*')
            .byId( 1 );
        assert( !Array.isArray( rs ) );
        assert( rs.Vendor.id === 1 );
        assert( !rs.Vendor.name );
    });
    it( "query Partnumber without filtering the id", async function () {
        let rs = await Partnumber.select('*')
            .where( Partnumber.id.equals( 1 ) )
            .exec();
        assert( Array.isArray( rs ) );
        assert( rs.length > 0 );
        assert( rs[0].Vendor.id === 1 );
        assert( !rs[0].Vendor.name );
    });
    it( "query Partnumber with a filter", async function () {
        let rs = await Partnumber.select('*')
            .where( Partnumber.name.equals( 'PN001' ) )
            .exec();
        assert( Array.isArray( rs ) );
        assert( rs.length > 0 );
        assert( rs[0].Vendor.id === 1 );
        assert( !rs[0].Vendor.name );
    });
    it( "query all objectLookups (Vendor)", async function () {
        // record set
        let query = Partnumber.select( Partnumber.Vendor );
            // .where( Customer.name.equals( 'Yadel' ) )
        
        assert( query.relateds );
        assert( query.relateds.Vendor );
        assert( query.columns );
        assert( query.columns.length > 0 );
        assert( query.columns[0] );
        assert( query.columns[0].field.name === 'Vendor' );
        assert( query.columns[0].foreignTableAlias === '_jt_VENDOR_Vendor' );
        assert( query.columns[0].idFieldKey === 'vendor_id' );
        assert( query.relateds.Vendor );
        // assert( rs.relateds.Vendor === rs.columns[1] );
        let rs = await query.exec();
        assert( rs.length > 0 );
        assert( rs[0].Vendor.name === 'VendorX' );
    });
});
