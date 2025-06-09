const {Partnumber,Device} = require("./_common-schema.js");
const assert = require( "assert" );
const models = require("../models/index");


describe('All tests on WHERE conditions, with various parameters', function() {


    // get data with api endpoint

    // INCLUDE, exact value filter
    it('should filter data with exact match', function(done) {
        chai.request(server)
            .get('/orm/Customer/all?iname[]=Wordpedia')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.equal(1); // should have 1 record
                res.body[0].should.have.property('id');
                res.body[0].id.should.equals(1);
                res.body[0].should.have.property('name');
                res.body[0].name.should.equals('Wordpedia');
                res.body[0].should.have.property('address');
                res.body[0].should.have.property('telephone');
                done();
            });
    });

    // CONTAINS, string filter ("like")
    it('should filter data with text containing', function(done) {
        chai.request(server)
            .get('/orm/Customer/all?cname[]=ord')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.equal(2); // should have 1 record
                res.body[0].should.have.property('id');
                res.body[0].id.should.equals(1);
                res.body[0].should.have.property('name');
                res.body[0].name.should.equals('Wordpedia');
                res.body[0].should.have.property('address');
                res.body[0].should.have.property('telephone');
                res.body[1].should.have.property('id');
                res.body[1].id.should.equals(85);
                res.body[1].should.have.property('name');
                res.body[1].name.should.equals('Wordware');
                done();
            });
    });

    // include/exclude null values
    it('should filter string excluding null', function(done) {
        chai.request(server)
            .get('/orm/User/all?ntelephone[]=null&asc=telephone')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.equal(2); // should have 1 record
                res.body[0].should.have.property('id');
                done();
            });
    });
    it('should filter date excluding null', function(done) {
        chai.request(server)
            .get('/orm/Project/all?nstart_date[]=null&asc=start_date')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.equal(2);
                res.body[0].should.have.property('id');
                res.body[0].id.should.equal(1);
                done();
            });
    });
    it('should filter including date null and a specific value', function(done) {
        chai.request(server)
            .get('/orm/Project/all?istart_date[]=null&istart_date[]=2023-01-23&asc=start_date')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.equal(4); // should have 4 record
                res.body[0].should.have.property('id');
                done();
            });
    });
    it('should filter excluding date null and a specific value', function(done) {
        chai.request(server)
            .get('/orm/Project/all?nstart_date[]=null&nstart_date[]=2023-01-23&asc=start_date')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.equal(1); // should have 1 record
                res.body[0].should.have.property('id');
                res.body[0].id.should.equal(3);
                done();
            });
    });

    it('should filter a column with a CALC function', function(done) {
        chai.request(server)
            .get('/orm/DevicePrice/all?iearnings[]=200')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.length.should.equals(4);
                done();
            });
    });




    // get data querying the model
    it( "search for a device with null Partnumber", async function () {
        
        let rs = await Device.select()
            .where( Device.Partnumber.isNull() )
            .exec();
            
        assert( rs.length === 0 );
    });
    it( "search for a device with null ip_address", async function () {
        
        let rs = await Device.select()
            .where( Device.ip_address.isNull() )
            .exec();
            
        assert( rs.length === 1 );
        assert( rs[0].ip_address === null);
     });

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

    it( "query Partnumber with where condition (id.equals)", async function () {
        let rs = await Partnumber.select('*')
            .where( Partnumber.id.equals( 1 ) )
            .exec();
        assert( Array.isArray( rs ) );
        assert( rs.length === 1 );
        assert( rs[0].vendor_foreign.id === 1 );
        assert( !rs[0].vendor_foreign.name );
    });
    it( "query Partnumber with a filter", async function () {
        let rs = await Partnumber.select('*')
            .where( Partnumber.part_number.equals( 'DM4004' ) )
            .exec();
        assert( Array.isArray( rs ) );
        assert( rs.length === 1 );
        assert( rs[0].id === 4);
        assert( rs[0].vendor_foreign.id === 1 );
        assert( !rs[0].vendor_foreign.name );
    });

    it( "has an Entity", async function () {
        let Customer = models.Customer;
        assert( Customer.metaData.name === 'Customer' );
        assert( Customer.metaData.model.fields );
        let rs = await Customer.select('*')
            .where( Customer.name.equals( 'Yadel' ) )
            .exec();
        assert( rs.length === 1 );
    });
});