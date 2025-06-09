const {Vendor,Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );


describe( "Join related", function () {
    it( "query Partnumber without related", async function () {
  /*       assert( Partnumber.metaData.name === 'Partnumber' );
        assert( Partnumber.metaData.model.fields );
        let rs = await Partnumber.select('*')
            .exec();
        assert( rs.length > 0 );
        assert( rs[0].Vendor.id === 1 );
        assert( !rs[0].Vendor.name ); */
        assert( Device.metaData.name === 'Device' );
        assert( Device.metaData.model.fields );
        let rs = await Device.select('*')
            .exec();
        assert( rs.length > 0 );
        assert( rs[0].Partnumber.id === 3 );
        assert( !rs[0].Partnumber.part_number );
    });
    it( "query all objectLookups (Partnumber)", async function () {
        // prepares the query
        let query = Device.select( Device.Partnumber );
        
        assert( query.relateds );
        assert( query.relateds.Partnumber );
        assert( query.columns );
        assert( query.columns.length > 0 );
        assert( query.columns[0] );
        assert( query.columns[0].field.name === 'Partnumber' );
        assert( query.columns[0].foreignTableAlias === '_jt_PARTNUMBER_Partnumber' );
        assert( query.columns[0].idFieldKey === 'device_model_id' );
        assert( query.relateds.Partnumber );
        // assert( rs.relateds.Vendor === rs.columns[1] );
        let rs = await query.exec();
        assert( rs.length > 0 );
        assert( rs[0].Partnumber.part_number === 'DM3003' );
    });
    it( "query '*' and all objectLookup (Partnumber)", async function () {
        // record set
        let query = Device.select('*')
            // .joinAllRelated();
            .selectAllRelated();
            // .where( Customer.name.equals( 'Yadel' ) )
        
        assert( query.relateds );
        assert( query.relateds.Partnumber );
        assert( query.columns );
        assert( query.columns.length > 1 );
        assert( query.columns[1] );
        assert( query.columns[1].field.name === 'Partnumber' );
        assert( query.columns[1].foreignTableAlias === '_jt_PARTNUMBER_Partnumber' );
        assert( query.columns[1].idFieldKey === 'device_model_id' );
        assert( query.relateds.Partnumber );
        // assert( rs.relateds.Vendor === rs.columns[1] );
        let rs = await query.exec();
        assert( rs.length > 0 );
        assert( rs[0].Partnumber.part_number === 'DM3003' );
    });
    it( "query Device getting Partnumber description", async function () {
        
        let rs = await Device.select('*')
            .select( 'Partnumber' )
            // .debug()
            .exec();
        assert( rs.length > 0 );
        assert( rs[0].Partnumber );
        assert( rs[0].Partnumber.description );
        assert( rs[0].Partnumber.description === 'Secure Firewall' );
    });

    // new seeding doesn't have objectLink on objectLink
    it( "query Device getting Partnumber.Vendor as object", async function () {
        
        let query = Device //.select('*')
            .select( 'Partnumber.vendor_foreign' )
            // .select( Partnumber.Vendor )
            // .select( Device.Partnumber.Vendor )
            // .joinAllRelated()
            // .debug()
            // .exec();


        // prepares the query
        // let query = Partnumber.select( Partnumber.Vendor );
        
        assert( query.relateds );
        assert( query.relateds.vendor_foreign );
        assert( query.relateds.Partnumber );
        assert( query.columns );
        assert( query.columns.length > 0 );
        assert( query.columns[0] );
        assert( query.columns[0].field.name === 'Partnumber' );
        assert( query.columns[0].foreignTableAlias === '_jt_PARTNUMBER_Partnumber' );
        assert( query.columns[0].idFieldKey === 'device_model_id' );
        assert( query.columns[0].nested.field.name === 'vendor_foreign' );
        assert( query.columns[0].nested.foreignTableAlias === '_jt_VENDOR_vendor_foreign' );
        assert( query.columns[0].nested.idFieldKey === '_jt_PARTNUMBER_Partnumber.vendor_id' );
        // assert( rs.relateds.Vendor === rs.columns[1] );
        let rs = await query.exec();
        assert( rs.length > 0 );
        assert( rs[0].vendor_foreign === undefined );

        assert( rs.length > 0 );
        assert( rs[0].Partnumber );
        assert( rs[0].Partnumber.vendor_foreign );
        assert( rs[0].Partnumber.vendor_foreign.id === 1 );
        assert( rs[0].Partnumber.vendor_foreign.name === 'VendorX' );
    });
    it( "query Device without related by Id", async function () {
        let rs = await Device.select('*')
            .selectAllRelated()
            .byId( 1 );
        assert( !Array.isArray( rs ) );
        assert( rs.Partnumber.id === 3 );
        assert( rs.Partnumber.part_number === 'DM3003' );
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
        let query = Partnumber.select( Partnumber.vendor_foreign )
            .where( Partnumber.part_number.equals( 'DM1001' ) )
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
        assert( rs.length === 1 );
        assert( rs[0].vendor_foreign.name === 'VendorX' );
    });
    it( "query '*' and all objectLookup (Vendor)", async function () {
        // query
        let query = Partnumber.select('*')
            .selectAllRelated()
            .where( Partnumber.id.equals( 1 ) );
        
        assert( query.relateds );
        assert( query.relateds.vendor_foreign );
        assert( query.columns );
        assert( query.columns.length > 1 );
        assert( query.columns[1] );
        assert( query.columns[1].field.name === 'vendor_foreign' );
        assert( query.columns[1].foreignTableAlias === '_jt_VENDOR_vendor_foreign' );
        assert( query.columns[1].idFieldKey === 'vendor_id' );
        // assert( rs.relateds.Vendor === rs.columns[1] );
        let rs = await query.exec();
        assert( rs.length === 1 );
        assert( rs[0].vendor_foreign.name === 'VendorX' );
    });
    it( "query Device getting Partnumber description", async function () {
        // query
        let query = Device.select('*')
            .select( 'Partnumber' )
            .where( Partnumber.id.equals( 1 ) )
            // .debug();
        
        assert( query.relateds );

        let rs = await query.exec();
        assert( rs.length === 6 );
        assert( rs[0].Partnumber );
        assert( rs[0].Partnumber.description );
        assert( rs[0].Partnumber.description === 'High-speed Router' );
    });
    it( "query Device getting Partnumber.Vendor as object", async function () {
        
        let rs = await Device.select('*')
            .select( 'Partnumber.vendor_foreign' )
            .where( Device.id.equals( 1 ) )
            // .select( Partnumber.Vendor )
            // .select( Device.Partnumber.Vendor )
            // .joinAllRelated()
            // .debug()
            .exec();
        assert( rs.length === 1 );
        assert( rs[0].Partnumber );
        assert( rs[0].Partnumber.vendor_foreign );
        assert( rs[0].Partnumber.vendor_foreign.id === 3 );
        assert( rs[0].Partnumber.vendor_foreign.name === 'VendorZ' );
    });
});
