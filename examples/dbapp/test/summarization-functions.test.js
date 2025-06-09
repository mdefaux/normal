const {Vendor,Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );


describe( "Max functions", function () {
    it( "returns the maximum value of ", async function () {
        
        let rs = await Device.select( Device.serial_number.max() )
            .exec();
            
        assert( rs.length === 1 );
        assert( rs[0].max );
        assert( typeof rs[0].max === 'string'  );
        assert( rs[0].max === 'L00AY3J4R5L6' );
    });
    it( "function maximum determines a condition ", async function () {
        
        let rs = await Device.select( '*' )
            .where( Device.serial_number.equals( 
                Device.select( Device.serial_number.max() ) ) 
            )
            .exec();
            
        assert( rs.length === 1 );
        assert( rs[0].id );
        // assert( typeof rs[0].max === 'number'  );
        assert( rs[0].id === 16  );
        assert( rs[0].serial_number === 'L00AY3J4R5L6' );
    });
    it( "returns the maximum value of Object lookup", async function () {
        // this one uses FieldConditionDef .max method
        let rs = await Device.select( Device.Partnumber.max() )
            .exec();
            
        assert( rs.length === 1 );
        assert( rs[0].max );
        assert( typeof rs[0].max === 'number'  );
        assert( rs[0].max === 5 );
    });
    it.skip( "returns the record with the maximum value of Object lookup", async function () { // too complicated? seems to have all records as result.
        // this one uses FieldConditionDef .max method
        let rs = await Device.select(  )
            //.andWhere(cp =>
            .where(cp =>
                cp.Partnumber.equals( Device
                    .select( Device.Partnumber.max() )
                    .alias("inner")
                    // .select(versionedEntity.Versione.max())
                    .where(icp => icp.id.equals(cp.id))
                    // .andWhere(icp => icp.Versione.in(id_ver_ancestors))
                )
            )
            // .debug()
            .exec();
            
        assert( rs.length === 5 );
        // assert( rs.length === 1 );
        // assert( rs[0].max );
        // assert( typeof rs[0].max === 'number'  );
        // assert( rs[0].max === 5 );
    });
});
