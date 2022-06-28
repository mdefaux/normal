describe('Model test', function() {

    
    it('should return model of entity xxxx', function(done) {
        chai.request(server)
            .get('/model')
            .end(function(err, res) {
                res.should.have.status(200);
                done();
            });
    });
});