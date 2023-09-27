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
    it( "returns the group by field name", async function () {
        
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
              ? false
              : "*"
          )
        //   .externalParameters(sessionInfo)
          .joinAllRelated()
          // .relation( req.params.relation !== 'all' && req.params.relation )
          // .select(selectedFields)
          .where(filters)
          .groupBy(groupedFields)
          .orderBy(sortingFields)
          .exec();
      
    });
});
