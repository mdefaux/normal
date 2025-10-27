describe('Null in query test', function() {

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
});