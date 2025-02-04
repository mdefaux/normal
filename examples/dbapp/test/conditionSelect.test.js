const {Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );

describe('All tests on SELECT conditions, with various parameters', function() {


    // get data with api endpoint
    it('should get first page of data', function(done) {
        chai.request(server)
            .get('/orm/Customer/all')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json; // should be json
                res.body.should.be.a('array');
                res.body.length.should.equal(50); // number of entity
                res.body[0].should.have.property('id');
                res.body[0].id.should.equals(1);
                res.body[0].should.have.property('name');
                res.body[0].name.should.equals('Wordpedia');
                res.body[0].should.have.property('address');
                res.body[0].should.have.property('telephone');
                done();
            });
    });


    // get data querying the model
    it( "query Partnumber byId", async function () {
        let rs = await Partnumber.select('*')
            .byId( 1 );
        assert( !Array.isArray( rs ) );
        assert( rs.vendor_foreign.id === 1 );
        assert( !rs.vendor_foreign.name ); // not getting label of objectLinks; object with id only {id: 1}
    });

    it( "query all objectLookups (Vendor)", async function () {
        // record set
        let query = Partnumber.select( Partnumber.vendor_foreign );
            // .where( Customer.name.equals( 'Yadel' ) )
        
        assert( query.relateds );
        assert( query.relateds.vendor_foreign );
        assert( query.columns );
        assert( query.columns.length > 0 );
        assert( query.columns[0] );
        assert( query.columns[0].field.name === 'vendor_foreign' );
        assert( query.columns[0].foreignTableAlias === '_jt_VENDOR_vendor_foreign' );
        assert( query.columns[0].idFieldKey === 'vendor_id' );
        // assert( rs.relateds.Vendor === rs.columns[1] );
        let rs = await query.exec();
        assert( rs.length === 5 );
        assert( rs[0].vendor_foreign.name === 'VendorX' );
    });


        // tests on join/selectAllRelated
        it( "query Partnumber without related", async function () {
                  assert( Device.metaData.name === 'Device' );
                  assert( Device.metaData.model.fields );
                  let rs = await Device.select('*')
                      .exec();
                  assert( rs.length > 0 );
                  assert( rs[0].Partnumber.id === 3 );
                  assert( !rs[0].Partnumber.part_number );
              });
        it( "query all objectLookups (Partnumber)", async function () {
            // prepares the query
            let query = Device.select( Device.Partnumber );
            
            assert( query.relateds );
            assert( query.relateds.Partnumber );
            assert( query.columns );
            assert( query.columns.length > 0 );
            assert( query.columns[0] );
            assert( query.columns[0].field.name === 'Partnumber' );
            assert( query.columns[0].foreignTableAlias === '_jt_PARTNUMBER_Partnumber' );
            assert( query.columns[0].idFieldKey === 'device_model_id' );
            assert( query.relateds.Partnumber );
            // assert( rs.relateds.Vendor === rs.columns[1] );
            let rs = await query.exec();
            assert( rs.length > 0 );
            assert( rs[0].Partnumber.part_number === 'DM3003' );
        });
        it( "query '*' and all objectLookup (Partnumber)", async function () {
            // record set
            let query = Device.select('*')
                // .joinAllRelated();
                .selectAllRelated();
                // .where( Customer.name.equals( 'Yadel' ) )
            
            assert( query.relateds );
            assert( query.relateds.Partnumber );
            assert( query.columns );
            assert( query.columns.length > 1 );
            assert( query.columns[1] );
            assert( query.columns[1].field.name === 'Partnumber' );
            assert( query.columns[1].foreignTableAlias === '_jt_PARTNUMBER_Partnumber' );
            assert( query.columns[1].idFieldKey === 'device_model_id' );
            assert( query.relateds.Partnumber );
            // assert( rs.relateds.Vendor === rs.columns[1] );
            let rs = await query.exec();
            assert( rs.length > 0 );
            assert( rs[0].Partnumber.part_number === 'DM3003' );
        });
        it( "query Device getting Partnumber description", async function () {
            
            let rs = await Device.select('*')
                .select( 'Partnumber' )
                // .debug()
                .exec();
            assert( rs.length > 0 );
            assert( rs[0].Partnumber );
            assert( rs[0].Partnumber.description );
            assert( rs[0].Partnumber.description === 'Secure Firewall' );
        });
    
        // new seeding doesn't have objectLink on objectLink
        it( "query Device getting Partnumber.Vendor as object", async function () {
            
            let query = Device //.select('*')
                .select( 'Partnumber.vendor_foreign' )

        assert( query.relateds );
            assert( query.relateds.vendor_foreign );
            assert( query.relateds.Partnumber );
            assert( query.columns );
            assert( query.columns.length > 0 );
            assert( query.columns[0] );
            assert( query.columns[0].field.name === 'Partnumber' );
            assert( query.columns[0].foreignTableAlias === '_jt_PARTNUMBER_Partnumber' );
            assert( query.columns[0].idFieldKey === 'device_model_id' );
            assert( query.columns[0].nested.field.name === 'vendor_foreign' );
            assert( query.columns[0].nested.foreignTableAlias === '_jt_VENDOR_vendor_foreign' );
            assert( query.columns[0].nested.idFieldKey === '_jt_PARTNUMBER_Partnumber.vendor_id' );
            // assert( rs.relateds.Vendor === rs.columns[1] );
            let rs = await query.exec();
            assert( rs.length > 0 );
            assert( rs[0].vendor_foreign === undefined );
    
            assert( rs.length > 0 );
            assert( rs[0].Partnumber );
            assert( rs[0].Partnumber.vendor_foreign );
            assert( rs[0].Partnumber.vendor_foreign.id === 1 );
            assert( rs[0].Partnumber.vendor_foreign.name === 'VendorX' );
        });
        it( "query Device without related by Id", async function () {
            let rs = await Device.select('*')
                .selectAllRelated()
                .byId( 1 );
            assert( !Array.isArray( rs ) );
            assert( rs.Partnumber.id === 3 );
            assert( rs.Partnumber.part_number === 'DM3003' );
        });
        it( "query all objectLookups (Vendor)", async function () {
            // record set
            let query = Partnumber.select( Partnumber.vendor_foreign )
                .where( Partnumber.part_number.equals( 'DM1001' ) )
                // .where( Customer.name.equals( 'Yadel' ) )
            
            assert( query.relateds );
            assert( query.relateds.vendor_foreign );
            assert( query.columns );
            assert( query.columns.length > 0 );
            assert( query.columns[0] );
            assert( query.columns[0].field.name === 'vendor_foreign' );
            assert( query.columns[0].foreignTableAlias === '_jt_VENDOR_vendor_foreign' );
            assert( query.columns[0].idFieldKey === 'vendor_id' );
            // assert( rs.relateds.Vendor === rs.columns[1] );
            let rs = await query.exec();
            assert( rs.length === 1 );
            assert( rs[0].vendor_foreign.name === 'VendorX' );
        });
        it( "query '*' and all objectLookup (Vendor)", async function () {
            // query
            let query = Partnumber.select('*')
                .selectAllRelated()
                .where( Partnumber.id.equals( 1 ) );
            
            assert( query.relateds );
            assert( query.relateds.vendor_foreign );
            assert( query.columns );
            assert( query.columns.length > 1 );
            assert( query.columns[1] );
            assert( query.columns[1].field.name === 'vendor_foreign' );
            assert( query.columns[1].foreignTableAlias === '_jt_VENDOR_vendor_foreign' );
            assert( query.columns[1].idFieldKey === 'vendor_id' );
            // assert( rs.relateds.Vendor === rs.columns[1] );
            let rs = await query.exec();
            assert( rs.length === 1 );
            assert( rs[0].vendor_foreign.name === 'VendorX' );
        });
        it( "query Device getting Partnumber description", async function () {
            // query
            let query = Device.select('*')
                .select( 'Partnumber' )
                .where( Partnumber.id.equals( 1 ) )
                // .debug();
            
            assert( query.relateds );
    
            let rs = await query.exec();
            assert( rs.length === 6 );
            assert( rs[0].Partnumber );
            assert( rs[0].Partnumber.description );
            assert( rs[0].Partnumber.description === 'High-speed Router' );
        });
        it( "query Device getting Partnumber.Vendor as object", async function () {
            
            let rs = await Device.select('*')
                .select( 'Partnumber.vendor_foreign' )
                .where( Device.id.equals( 1 ) )
                // .select( Partnumber.Vendor )
                // .select( Device.Partnumber.Vendor )
                // .joinAllRelated()
                // .debug()
                .exec();
            assert( rs.length === 1 );
            assert( rs[0].Partnumber );
            assert( rs[0].Partnumber.vendor_foreign );
            assert( rs[0].Partnumber.vendor_foreign.id === 3 );
            assert( rs[0].Partnumber.vendor_foreign.name === 'VendorZ' );
        }); 
});