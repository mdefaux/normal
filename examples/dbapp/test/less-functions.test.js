const {Vendor,Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );


describe( "less functions", function () {
    it( "returns the less value of (string values)", async function () {
        
        let rs = await Partnumber.select('*') 
            .where( Partnumber.part_number.lessThan('DM3000') )
            .exec();
            
        assert( rs.length === 2 );
      //  assert( rs[0].max );
      //  assert( typeof rs[0].max === 'string'  );
     //   assert( rs[0].max === 'SN005' );
    });
    it( "returns the less value of object link", async function () {
        
        let rs = await Device.select('*') 
            .where( Device.Partnumber.lessThan(3) ) // uses id
            .exec();
            
        assert( rs.length === 10);
      //  assert( rs[0].max );
      //  assert( typeof rs[0].max === 'string'  );
     //   assert( rs[0].max === 'SN005' );
    });
});
