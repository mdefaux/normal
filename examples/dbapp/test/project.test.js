describe('Project test', function() {

    it('should return all projects', function(done) {
        chai.request(server)
            .get('/project')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json; // should be json
                res.body.should.be.a('array');
                res.body.length.should.equal(5); // number of project
                res.body[0].should.have.property('id');
                res.body[0].should.have.property('name');
                res.body[0].should.have.property('User');
                done();
            });
    });
    it('should return all projects for user A', function(done) {
        chai.request(server)
            .get('/project/aarancioni')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json; // should be json
                res.body.should.be.a('array');
                res.body.length.should.equal(3); // number of project
                res.body[0].should.have.property('id');
                res.body[0].should.have.property('name');
                res.body[0].should.have.property('User');
                done();
            });
    });
    // it('should get first page of data', function(done) {
    //     chai.request(server)
    //         .get('/orm/Customer/all')
    //         .end(function(err, res) {
    //             res.should.have.status(200);
    //             res.should.be.json; // should be json
    //             res.body.should.be.a('array');
    //             res.body.length.should.equal(50); // number of entity
    //             res.body[0].should.have.property('id');
    //             res.body[0].id.should.equals(1);
    //             res.body[0].should.have.property('name');
    //             res.body[0].name.should.equals('Wordpedia');
    //             res.body[0].should.have.property('address');
    //             res.body[0].should.have.property('telephone');
    //             done();
    //         });
    // });
    // it('should filter data with exact match', function(done) {
    //     chai.request(server)
    //         .get('/orm/Customer/all?iname[]=Wordpedia')
    //         .end(function(err, res) {
    //             res.should.have.status(200);
    //             res.should.be.json;
    //             res.body.should.be.a('array');
    //             res.body.length.should.equal(4); // should have 1 record
    //             res.body[0].should.have.property('id');
    //             res.body[0].id.should.equals(1);
    //             res.body[0].should.have.property('name');
    //             res.body[0].name.should.equals('Wordpedia');
    //             res.body[0].should.have.property('address');
    //             res.body[0].should.have.property('telephone');
    //             done();
    //         });
    // });
    // it('should filter data with text containing', function(done) {
    //     chai.request(server)
    //         .get('/orm/Customer/all?cname[]=ord')
    //         .end(function(err, res) {
    //             res.should.have.status(200);
    //             res.should.be.json;
    //             res.body.should.be.a('array');
    //             res.body.length.should.equal(12); // should have 1 record
    //             res.body[0].should.have.property('id');
    //             res.body[0].id.should.equals(1);
    //             res.body[0].should.have.property('name');
    //             res.body[0].name.should.equals('Wordpedia');
    //             res.body[0].should.have.property('address');
    //             res.body[0].should.have.property('telephone');
    //             done();
    //         });
    // });
    // it('should count the whole recordset', function(done) {
    //     chai.request(server)
    //         .get('/orm/Customer/all?xcount=*')
    //         .end(function(err, res) {
    //             res.should.have.status(200);
    //             res.should.be.json;
    //             res.body.should.be.a('array');
    //             res.body.length.should.equal(1); // should have 1 record
    //             res.body[0].should.have.property('COUNT');
    //             res.body[0].COUNT.should.equals('1000');
    //             // res.body[0].should.have.property('name');
    //             // res.body[0].name.should.equals('Wordpedia');
    //             // res.body[0].should.have.property('address');
    //             // res.body[0].should.have.property('telephone');
    //             done();
    //         });
    // });
});