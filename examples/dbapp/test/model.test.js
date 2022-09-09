describe('Model test', function() {

    it('should return an array with 3 models', function(done) {
        chai.request(server)
            .get('/model')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json; // si assicura che il risultato sia json
                res.body.should.have.property('asset');
                res.body.should.have.property('customer');
                res.body.should.have.property('service');
                done();
            });
    });
    
    it('should return model of entity "asset"', function(done) {
        chai.request(server)
            .get('/model/asset')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json; // si assicura che il risultato sia json
                // res.body.should.be.json;
                res.should.have.property('columns');
                res.columns.should.have.property('part_number');
                res.columns.should.have.property('Vendor');
                done();
            });
    });
});