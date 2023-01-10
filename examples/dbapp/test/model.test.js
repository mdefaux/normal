describe('Model test', function() {

    it('should return an array with 3 models', function(done) {
        chai.request(server)
            .get('/orm/models')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json; // si assicura che il risultato sia json
                res.body.should.have.property('User');
                res.body.should.have.property('Customer');
                res.body.should.have.property('Project');
                // res.body.should.have.property('Asset');
                // res.body.should.have.property('Service');
                done();
            });
    });
    
    it('should return model of entity "asset"', function(done) {
        chai.request(server)
            .get('/orm/model/Project')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json; // si assicura che il risultato sia json
                // res.body.should.be.json;
                res.body.should.have.property('columns');
                res.body.columns.should.have.property('name');
                res.body.columns.should.have.property('User');
                done();
            });
    });
});