const {Vendor,Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );


describe( "Join related", function () {
    it( "query Partnumber without related", async function () {
        assert( Partnumber.metaData.name === 'Partnumber' );
        assert( Partnumber.metaData.model.fields );
        let rs = await Partnumber.select('*')
            // .where( Customer.name.equals( 'Yadel' ) )
            .exec();
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
    it( "query '*' and all objectLookup (Vendor)", async function () {
        // record set
        let query = Partnumber.select('*')
            .joinAllRelated();
            // .where( Customer.name.equals( 'Yadel' ) )
        
        assert( query.relateds );
        assert( query.relateds.Vendor );
        assert( query.columns );
        assert( query.columns.length > 1 );
        assert( query.columns[1] );
        assert( query.columns[1].field.name === 'Vendor' );
        assert( query.columns[1].foreignTableAlias === '_jt_VENDOR_Vendor' );
        assert( query.columns[1].idFieldKey === 'vendor_id' );
        assert( query.relateds.Vendor );
        // assert( rs.relateds.Vendor === rs.columns[1] );
        let rs = await query.exec();
        assert( rs.length > 0 );
        assert( rs[0].Vendor.name === 'VendorX' );
    });
    it( "query Device getting Partnumber description", async function () {
        
        let rs = await Device.select('*')
            .select( 'Partnumber' )
            // .debug()
            .exec();
        assert( rs.length > 0 );
        assert( rs[0].Partnumber );
        assert( rs[0].Partnumber.description );
        assert( rs[0].Partnumber.description === 'Part A' );
    });
    it( "query Device getting Partnumber.Vendor as object", async function () {
        
        let rs = await Device.select('*')
            .select( 'Partnumber.Vendor' )
            // .select( Partnumber.Vendor )
            // .select( Device.Partnumber.Vendor )
            // .joinAllRelated()
            // .debug()
            .exec();
        assert( rs.length > 0 );
        assert( rs[0].Partnumber );
        assert( rs[0].Partnumber.Vendor );
        assert( rs[0].Partnumber.Vendor.id === 1 );
        assert( rs[0].Partnumber.Vendor.name === 'VendorX' );
    });
});
