describe('URL parse test', function() {

    it('should return a id_customer = 4 filter on entity asset', function(done) {
        chai.request(server)
            .get('/orm/asset/all?iCustomer[]=4')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json; // si assicura che il risultato sia json
                res.body.should.be.a('array');
                res.body.length.should.equal(1); // number of entity
                res.body[0].should.have.property('column');
                res.body[0].column.should.equal('id_customer');
                done();
            });
    });
    
    it('should return a id_customer group by on entity asset', function(done) {
        chai.request(server)
            .get('/orm/asset/all?gbCustomer[]')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.equal(1);
                res.body[0].should.have.property('column');
                res.body[0].column.should.equal('id_customer');
                done();
            });
    });
    
    it('should return a "part number" field on entity asset', function(done) {
        chai.request(server)
            .get('/orm/asset/all?slpart_number[]')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.equal(1);
                res.body[0].should.have.property('column');
                res.body[0].column.should.equal('part_number');
                done();
            });
    });

    it('datagrid test', function(done) {
        chai.request(server)
            .get('/datagrid')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.equal(3);
                res.body[0].should.have.property('nome');
                res.body[0].should.have.property('cognome');
                done();
            });
    });
});