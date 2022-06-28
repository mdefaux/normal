describe('Model test', function() {

    
    it('should return model of entity xxxx', function(done) {
        chai.request(server)
            .get('/api/ORM/xxxx/Version?iid_version[]=3')
            .end(function(err, res) {
                res.should.have.status(200);
                done();
            });
    });
});