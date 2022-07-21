describe('Generic test template API', function() {
    it('should create a new record', function(done) {
        chai.request(server)
            .post('/api/genericApi')
            .send( {
                "nome": "Nuova",
                "data_creazione": new Date('2022-06-03'),
              } )
            .end(function(err, res) {
                res.should.have.status(200);
                done();
            });
    });
    it('should return a list with all records', function(done) {
        chai.request(server)
            .get('/api/genericApi')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json; // si assicura che il risultato sia json
                res.body.should.be.a('array');
                res.body.length.should.equal(2); // number of records
                res.body[0].should.have.property('<property>');
                res.body[0].property.should.equal('<value>');
                done();
            });
    });
    it('should return a specific record with id:2', function(done) {
        chai.request(server)
            .get('/api/genericApi/2')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json; // si assicura che il risultato sia json
                res.body.should.have.property('<property>');
                res.body.id.should.equal(2);
                done();
            });
    });
    it('should update successfully a record with id=2', function(done) {
        chai.request(server)
            .post('/api/genericApi/2')
            .send( {
                "prop1": "value1",
                "data": new Date('2022-06-03'),
                "prop2": "value2"
            } )
            .end(function(err, res) {
                res.should.have.status(200);
                done();
            });
    });
    it('should update unsuccessfully a record with id=3', function(done) {
        chai.request(server)
            .post('/api/genericApi/3')
            .send( {
                "prop1": "value1",
                "data": new Date('2022-06-03'),
                "prop2": "value2"             
            } )
            .end(function(err, res) {
                res.should.have.status(500);
                done();
            });
    });
    it('should delete successfully a record with id=2', function(done) {
        chai.request(server)
            .delete('/api/genericApi/2')
            .end(function(err, res) {
                res.should.have.status(200);
                done();
            });
    });
    it('should delete unsuccessfully a record with id=3', function(done) {
        chai.request(server)
            .delete('/api/genericApi/3')
            .end(function(err, res) {
                res.should.have.status(500);
                done();
            });
    });
});