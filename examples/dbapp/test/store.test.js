describe('Store test', function() {

    it('should return model for customer', function(done) {
        chai.request(server)
            .get('/orm/model/Customer')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json; // si assicura che il risultato sia json
                //res.body.length.should.equal(3); // number of entity
                res.body.should.have.property('columns');
                res.body.columns.should.have.property('id');
                res.body.columns.should.have.property('name');
                res.body.columns.should.have.property('address');
                res.body.columns.should.have.property('telephone');
                done();
            });
    });
});