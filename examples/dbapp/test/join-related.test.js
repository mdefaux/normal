const {Vendor,Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );


describe( "Join related", function () {
    // it( "query Partnumber without related", async function () {
    //     assert( Partnumber.metaData.name === 'Partnumber' );
    //     assert( Partnumber.metaData.model.fields );
    //     let rs = await Partnumber.select('*')
    //         .exec();
    //     assert( rs.length > 0 );
    //     assert( rs[0].Vendor.id === 1 );
    //     assert( !rs[0].Vendor.name );
    // });
    // it( "query all objectLookups (Vendor)", async function () {
    //     // prepares the query
    //     let query = Partnumber.select( Partnumber.Vendor );
        
    //     assert( query.relateds );
    //     assert( query.relateds.Vendor );
    //     assert( query.columns );
    //     assert( query.columns.length > 0 );
    //     assert( query.columns[0] );
    //     assert( query.columns[0].field.name === 'Vendor' );
    //     assert( query.columns[0].foreignTableAlias === '_jt_VENDOR_Vendor' );
    //     assert( query.columns[0].idFieldKey === 'vendor_id' );
    //     assert( query.relateds.Vendor );
    //     // assert( rs.relateds.Vendor === rs.columns[1] );
    //     let rs = await query.exec();
    //     assert( rs.length > 0 );
    //     assert( rs[0].Vendor.name === 'VendorX' );
    // });
    // it( "query '*' and all objectLookup (Vendor)", async function () {
    //     // record set
    //     let query = Partnumber.select('*')
    //         .joinAllRelated();
    //         // .where( Customer.name.equals( 'Yadel' ) )
        
    //     assert( query.relateds );
    //     assert( query.relateds.Vendor );
    //     assert( query.columns );
    //     assert( query.columns.length > 1 );
    //     assert( query.columns[1] );
    //     assert( query.columns[1].field.name === 'Vendor' );
    //     assert( query.columns[1].foreignTableAlias === '_jt_VENDOR_Vendor' );
    //     assert( query.columns[1].idFieldKey === 'vendor_id' );
    //     assert( query.relateds.Vendor );
    //     // assert( rs.relateds.Vendor === rs.columns[1] );
    //     let rs = await query.exec();
    //     assert( rs.length > 0 );
    //     assert( rs[0].Vendor.name === 'VendorX' );
    // });
    // it( "query Device getting Partnumber description", async function () {
        
    //     let rs = await Device.select('*')
    //         .select( 'Partnumber' )
    //         // .debug()
    //         .exec();
    //     assert( rs.length > 0 );
    //     assert( rs[0].Partnumber );
    //     assert( rs[0].Partnumber.description );
    //     assert( rs[0].Partnumber.description === 'Part A' );
    // });
    it( "query Device getting Partnumber.Vendor as object", async function () {
        
        let query = Device //.select('*')
            .select( 'Partnumber.Vendor' )
            // .select( Partnumber.Vendor )
            // .select( Device.Partnumber.Vendor )
            // .joinAllRelated()
            // .debug()
            // .exec();


        // prepares the query
        // let query = Partnumber.select( Partnumber.Vendor );
        
        assert( query.relateds );
        assert( query.relateds.Vendor );
        assert( query.relateds.Partnumber );
        assert( query.columns );
        assert( query.columns.length > 0 );
        assert( query.columns[0] );
        assert( query.columns[0].field.name === 'Partnumber' );
        assert( query.columns[0].foreignTableAlias === '_jt_PARTNUMBER_Partnumber' );
        assert( query.columns[0].idFieldKey === 'partnumber_id' );
        assert( query.columns[0].nested.field.name === 'Vendor' );
        assert( query.columns[0].nested.foreignTableAlias === '_jt_VENDOR_Vendor' );
        assert( query.columns[0].nested.idFieldKey === '_jt_PARTNUMBER_Partnumber.vendor_id' );
        // assert( rs.relateds.Vendor === rs.columns[1] );
        let rs = await query.exec();
        assert( rs.length > 0 );
        assert( rs[0].Vendor.name === 'VendorX' );

        assert( rs.length > 0 );
        assert( rs[0].Partnumber );
        assert( rs[0].Partnumber.Vendor );
        assert( rs[0].Partnumber.Vendor.id === 1 );
        assert( rs[0].Partnumber.Vendor.name === 'VendorX' );
    });
    it( "query Partnumber without related by Id", async function () {
        let rs = await Partnumber.select('*')
            .joinAllRelated()
            .byId( 1 );
        assert( !Array.isArray( rs ) );
        assert( rs.Vendor.id === 1 );
        assert( rs.Vendor.name === 'VendorX' );
    });
    // it( "query Partnumber without related filtering the id", async function () {
    //     let rs = await Partnumber.select('Vendor')
    //         .where( Partnumber.id.equals( 1 ) )
    //         .debug()
    //         .exec();
    //     assert( Array.isArray( rs ) );
    //     assert( rs.length > 0 );
    //     assert( rs[0].Vendor.id === 1 );
    //     assert( !rs[0].Vendor.name );
    // });
    // it( "query Partnumber without related with a filter", async function () {
    //     let rs = await Partnumber.select('Vendor')
    //         .where( Partnumber.name.equals( 'PN001' ) )
    //         .exec();
    //     assert( Array.isArray( rs ) );
    //     assert( rs.length > 0 );
    //     assert( rs[0].Vendor.id === 1 );
    //     assert( !rs[0].Vendor.name );
    // });
    it( "query all objectLookups (Vendor)", async function () {
        // record set
        let query = Partnumber.select( Partnumber.Vendor )
            .where( Partnumber.name.equals( 'PN001' ) )
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
            .joinAllRelated()
            .where( Partnumber.id.equals( 1 ) );
        
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
            .where( Partnumber.id.equals( 1 ) )
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
            .where( Device.id.equals( 1 ) )
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
