const {Vendor,Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );


describe( "Is Null", function () {
    it( "returns the group by column", async function () {
        
        let rs = await Device.select()
            .where( Device.Partnumber.isNull() )
            .exec();
            
        assert( rs.length === 0 );
        // assert( rs[0].max );
        // assert( typeof rs[0].max === 'string'  );
        // assert( rs[0].max === 'SN005' );
    });
});
