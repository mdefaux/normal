const {Vendor,Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );


describe( "less functions", function () {
    it( "returns the less value of ", async function () {
        
        let rs = await Device.select( Device.partnumber_id.lessThan(4) )
            .exec();
            
        assert( rs.length < 2 );
      //  assert( rs[0].max );
      //  assert( typeof rs[0].max === 'string'  );
     //   assert( rs[0].max === 'SN005' );
    });
});
