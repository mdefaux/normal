const {Vendor,Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );


describe( "Summarization functions", function () {
    it( "returns the maximum value of ", async function () {
        
        let rs = await Device.select( Device.serialnumber.max() )
            .exec();
            
        assert( rs.length === 1 );
        assert( rs[0].max );
        assert( typeof rs[0].max === 'string'  );
        assert( rs[0].max === 'SN005' );
    });
});
