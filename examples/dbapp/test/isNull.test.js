const {Vendor,Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );


describe( "Is Null", function () {
    it( "search for a device with null Partnumber", async function () {
        
        let rs = await Device.select()
            .where( Device.Partnumber.isNull() )
            .exec();
            
        assert( rs.length === 0 );
    });

    it( "search for a device with null ip_address", async function () {
        
        let rs = await Device.select()
            .where( Device.ip_address.isNull() )
            .exec();
            
        assert( rs.length === 1 );
        assert( rs[0].ip_address === null);
        // assert( rs[0].max );
        // assert( typeof rs[0].max === 'string'  );
        // assert( rs[0].max === 'SN005' );
    });
});
