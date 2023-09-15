const {Vendor,Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );


describe( "Join related", function () {
    it( "query Partnumber", async function () {
        assert( Partnumber.metaData.name === 'Partnumber' );
        assert( Partnumber.metaData.model.fields );
        let rs = await Partnumber.select('*')
            .joinAllRelated()
            // .debug()
            // .where( Customer.name.equals( 'Yadel' ) )
            .exec();
        assert( rs.length > 0 );
        assert( rs[0].Vendor.name === 'VendorX' );
    });
    it( "query Device getting partnumber description", async function () {
        
        let rs = await Device.select('*')
            .select( 'Partnumber' )
            // .debug()
            .exec();
        assert( rs.length > 0 );
        assert( rs[0].Partnumber );
        assert( rs[0].Partnumber.description );
        assert( rs[0].Partnumber.description === 'Part A' );
    });
    it( "query Device getting Partnumber.vendor as object", async function () {
        
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
        assert( rs[0].Partnumber.Vendor.name === 'VendorX' );
    });
});
