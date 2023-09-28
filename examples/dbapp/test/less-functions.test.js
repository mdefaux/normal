const {Vendor,Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );


describe( "less functions", function () {
    it( "returns the less value of ", async function () {
        
        let rs = await Device.select('*') 
            .where( Device.serialnumber.lessThan('SN004') )
            .exec();
            
        assert( rs.length < 4 );
      //  assert( rs[0].max );
      //  assert( typeof rs[0].max === 'string'  );
     //   assert( rs[0].max === 'SN005' );
    });
    it( "returns the less value of object link", async function () {
        
        let rs = await Device.select('*') 
            .where( Device.Partnumber.lessThan(4) ) // uses id
            .exec();
            
        assert( rs.length < 4 );
      //  assert( rs[0].max );
      //  assert( typeof rs[0].max === 'string'  );
     //   assert( rs[0].max === 'SN005' );
    });
});
