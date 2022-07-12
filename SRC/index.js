const defs = require('./ForteORM');
const StoreHost = require( './orm/StoreHost' )
const {URLquery} = require( './url_query' );


module.exports= {
    URLquery: URLquery,
    store: defs,
    StoreHost: StoreHost
};