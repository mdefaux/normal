const {Vendor,Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );


const { URLquery } = require("normaly");


describe( "GroupBy", function () {
    it( "returns the group by column", async function () {
        
        let rs = await Device.select( Device.Partnumber )
            .groupBy( Device.Partnumber )
            .exec();
            
        assert( rs.length === 5 );
        // assert( rs[0].max );
        // assert( typeof rs[0].max === 'string'  );
        // assert( rs[0].max === 'SN005' );
    });
    it( "returns the group by field name", async function () {
        
        let rs = await Device.select( 'Partnumber' )
            .groupBy( 'Partnumber' )
            .exec();
            
        assert( rs.length === 5 );
        // assert( rs[0].max );
        // assert( typeof rs[0].max === 'string'  );
        // assert( rs[0].max === 'SN005' );
    });
    it( "returns the group by field name with joinAllRelated", async function () {
        
        let rs = await Device.select( 'serialnumber' )
            .joinAllRelated()
            .where( Device.serialnumber.like( '%2' ) )
            .groupBy( 'serialnumber' )
            .exec();
            
        assert( rs.length === 1 );
        // assert( rs[0].max );
        // assert( typeof rs[0].max === 'string'  );
        // assert( rs[0].max === 'SN005' );
    });
    it( "returns the group by field name with selectAllRelated", async function () {
        
        let rs = await Device.select( 'serialnumber' )
            .selectAllRelated( false )
            .where( Device.serialnumber.like( '%2' ) )
            .groupBy( 'serialnumber' )
            .exec();
            
        assert( rs.length === 1 );
        // assert( rs[0].max );
        // assert( typeof rs[0].max === 'string'  );
        // assert( rs[0].max === 'SN005' );
    });
    it( "with selectAllRelated and none selected", async function () {
        
        let rs = await Device.select( false )
            .selectAllRelated( true )
            .where( Device.serialnumber.like( '%2' ) )
            .groupBy( 'serialnumber' )
            .exec();
            
        assert( rs.length === 1 );
        // assert( rs[0].max );
        // assert( typeof rs[0].max === 'string'  );
        // assert( rs[0].max === 'SN005' );
    });
    it( "with no Related but selected all", async function () {
        
      let rs = await Device.select( '*' )
          // .joinAllRelated()
          .where( Device.serialnumber.like( '%2' ) )
          // .groupBy( Device.Partnumber )
          // .debug()
          .exec();
          
      assert( rs.length === 1 );
      assert( rs[0].Partnumber );
      rs[0].Partnumber.should.have.property( 'id' );
      assert( rs[0].Partnumber.id === 2 );
      rs[0].Partnumber.should.not.have.property( 'name' );
      // assert( typeof rs[0].max === 'string'  );
      // assert( rs[0].max === 'SN005' );
  });
  it( "with Related but selected all", async function () {
      
      let rs = await Device.select( '*' )
        .selectAllRelated()
        .where( Device.serialnumber.like( '%2' ) )
        // .groupBy( Device.Partnumber )
        // .debug()
        .exec();
          
      assert( rs.length === 1 );
      assert( rs[0].Partnumber );
      rs[0].Partnumber.should.have.property( 'id' );
      assert( rs[0].Partnumber.id === 2 );
      rs[0].Partnumber.should.have.property( 'name' );
      assert( rs[0].Partnumber.name === 'PN002' );
      rs[0].Partnumber.should.have.property( 'description' );
      assert( rs[0].Partnumber.description === 'Part B' );
      rs[0].Partnumber.should.have.property( 'Vendor' );
      assert( rs[0].Partnumber.Vendor === 2 );  // TODO: should be an object itslef
  });
  // it( "with Related but selected all and filter on an Object Lookup", async function () {
      
  //   let rs = await Device.select( '*' )
  //       .joinAllRelated()
  //       .where( Device.Partnumber.like( '%2' ) )
  //       // .groupBy( Device.Partnumber )
  //       // .debug()
  //       .exec();
        
  //   assert( rs.length > 4 );
  //   // assert( rs[0].max );
  //   // assert( typeof rs[0].max === 'string'  );
  //   // assert( rs[0].max === 'SN005' );
  // });
    
  it( "with selectAllRelated with no group", async function () {
        
      let rs = await Device.select( '*' )
          .selectAllRelated()
          // .where( Device.Partnumber.like( '%2' ) )
          // .groupBy( Device.Partnumber )
          // .debug()
          .exec();
          
      assert( rs.length > 4 );
      // assert( rs[0].max );
      // assert( typeof rs[0].max === 'string'  );
      // assert( rs[0].max === 'SN005' );
  });

  it( "with selectAllRelated and none selected grouping an ObjectLookup", async function () {
      
      let rs = await Device.select( Device.Partnumber )
          .selectAllRelated( false )
          // .where( Device.Partnumber.like( '%2' ) )
          .groupBy( Device.Partnumber )
          // .debug()
          .exec();
          
      assert( rs.length > 4 );
      // assert( rs[0].max );
      // assert( typeof rs[0].max === 'string'  );
      // assert( rs[0].max === 'SN005' );
  });

  it( "returns the group by via url parsing", async function () {
      
      let {
          filters,
          selectedFields,
          groupedFields,
          sortingFields
      } = URLquery.parse(
          {
              xgb: [
                "serialnumber",
              ],
              cserialnumber: [
                "7",
              ],
            },
            Device,
          false
      );
      let rs = await Device.select(
          selectedFields.length > 0
            ? selectedFields
            : groupedFields?.length > 0
            ? groupedFields
            : "*"
        )
      //   .externalParameters(sessionInfo)
        .selectAllRelated( groupedFields.length === 0 )
        // .relation( req.params.relation !== 'all' && req.params.relation )
        // .select(selectedFields)
        .where(filters)
        .groupBy(groupedFields)
        .orderBy(sortingFields)
        .exec();
    
  });
});
