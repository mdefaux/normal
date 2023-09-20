const {Vendor} = require("./_common-schema.js");
const store = require("../models/store");
const assert = require( "assert" );


describe( "store getEntity function", function () {
    it( "returns entity Vendor", async function () {
        
        let rs = store.getEntity("Vendor");
            
        assert( rs );
        assert( rs === Vendor );
      //  assert( rs[0].max );
      //  assert( typeof rs[0].max === 'string'  );
     //   assert( rs[0].max === 'SN005' );
    });
});
