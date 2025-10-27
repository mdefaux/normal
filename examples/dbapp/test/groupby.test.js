const {Vendor,Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );


const { URLquery } = require("normaly");


describe( "GroupBy", function () {
    it( "returns the group by column", async function () {
        
        let rs = await Device.select( Device.Partnumber )
            .groupBy( Device.Partnumber )
            .exec();
            
        assert( rs.length === 5 );
        assert(rs[0].Partnumber);
        // assert( rs[0].max );
        // assert( typeof rs[0].max === 'string'  );
        // assert( rs[0].max === 'SN005' );
    });
    it( "returns the group by field name", async function () {
        
        let rs = await Device.select( 'Partnumber' )
            .groupBy( 'Partnumber' )
            .exec();
            
        assert( rs.length === 5 );
        assert(rs[0].Partnumber);
        // assert( rs[0].max );
        // assert( typeof rs[0].max === 'string'  );
        // assert( rs[0].max === 'SN005' );
    });
    it( "returns the group by field name with joinAllRelated", async function () {
        
        let rs = await Device.select( 'serial_number' )
            .joinAllRelated()
            .where( Device.serial_number.like( '%4' ) )
            .groupBy( 'serial_number' )
            .exec();
            
        assert( rs.length === 5 );
        // no elements end with something different from '4'
        assert( rs.find(e => {
            let lastLetter = e.serial_number?.substring(e.serial_number?.length -1);
            return lastLetter !== '4';
        }) === undefined );
        // assert( typeof rs[0].max === 'string'  );
        // assert( rs[0].max === 'SN005' );
    });
    it( "returns the group by field name with selectAllRelated", async function () {
        
        let rs = await Device.select( 'serial_number' )
            .selectAllRelated( false )
            .where( Device.serial_number.like( '%4' ) )
            .groupBy( 'serial_number' )
            .exec();
            
        assert( rs.length === 5 );
        // assert( rs[0].max );
        // assert( typeof rs[0].max === 'string'  );
        // assert( rs[0].max === 'SN005' );
    });
    it.skip( "with selectAllRelated and none selected", async function () { // seems to fail groupby function
        
        let rs = await Device.select( false )
            .selectAllRelated( true )
            .where( Device.serial_number.like( '%4' ) )
            .groupBy( 'serial_number' )
            .exec();
            
        assert( rs.length === 1 );
        // assert( rs[0].max );
        // assert( typeof rs[0].max === 'string'  );
        // assert( rs[0].max === 'SN005' );
    });
    it( "with no Related but selected all", async function () {
        
      let rs = await Device.select( '*' )
          // .joinAllRelated()
          .where( Device.serial_number.like( '%4K5L6' ) )
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
        .where( Device.serial_number.like( '%4K5L6' ) )
        // .groupBy( Device.Partnumber )
        // .debug()
        .exec();
          
      assert( rs.length === 1 );
      assert( rs[0].Partnumber );
      rs[0].Partnumber.should.have.property( 'id' );
      assert( rs[0].Partnumber.id === 2 );
      rs[0].Partnumber.should.have.property( 'part_number' );
      assert( rs[0].Partnumber.part_number === 'DM2002' );
      rs[0].Partnumber.should.have.property( 'description' );
      assert( rs[0].Partnumber.description === 'Enterprise Switch' );
      rs[0].Partnumber.should.have.property( 'vendor_foreign' );
      assert( rs[0].Partnumber.vendor_foreign === 2 );  // TODO: should be an object itslef
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
          
      assert( rs.length === 20 );
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
          
      assert( rs.length === 5 );
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
                "serial_number",
              ],
              cserial_number: [
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
