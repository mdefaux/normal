const defs = require('./ForteORM');
const StoreHost = require( './orm/StoreHost' )
const {URLquery} = require( './url_query' );

function func ()
{
    console.log("messaggio");
}


module.exports= {
    func:func,
    URLquery: URLquery,
    store: defs,
    StoreHost: StoreHost
};