const {Device} = require("./_common-schema.js");
const assert = require( "assert" );

describe('All tests on operations conditions, with various parameters', function() {
    // all tests on particular conditions, like COUNT, CONCAT, CALC ...

    // get data with api endpoint

    // COUNT
    it('should count the whole recordset', function(done) {
        chai.request(server)
            .get('/orm/Customer/all?xcount=*')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.equal(1); // should have 1 record
                res.body[0].should.have.property('COUNT');
                res.body[0].COUNT.should.equals('128');
                done();
            });
    });


    it('should select all columns from a table with a CALC function', function(done) {
        chai.request(server)
            .get('/orm/DevicePrice/all')
            .end(function(err, res) {
                res.should.have.status(200);
                res.body[0].should.have.property("earnings");
                res.body.length.should.equals(20);
                done();
            });
    });

    // sum of a CALC function
    // fails: seems to build select function with CALC field closing and opening the string in randomic positions
    // example of failing query: select sum("device"."sell_price - device"."buy_price") ...
    it.skip('should get the sum of a calc field', function(done) {
        chai.request(server)
            .get('/orm/DevicePrice/all?xsum[]=earnings')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.equal(1); // should have 1 record
                res.body[0].should.have.property('COUNT');
                res.body[0].COUNT.should.equals('128');
                done();
            });
    });

    // ----------------------------------------------------------------------------
    // get data querying the model

    // MAX
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
        });
    // max of a CALC function: not working.
    it.skip( "returns the maximum value of a calc function", async function () {
        // this one uses FieldConditionDef .max method
        let rs = await Device.select( Device.earnings.max() )
            .exec();
            
        assert( rs.length === 1 );
        assert( rs[0].max );
        assert( typeof rs[0].max === 'number'  );
        assert( rs[0].max === 5 );
    });
});