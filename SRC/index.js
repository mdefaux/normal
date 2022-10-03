const defs = require('./ForteORM');
const StoreHost = require( './orm/StoreHost' )
const {URLquery} = require( './url_query' );

const {KdbStoreHost} = require( './orm/kdbhost/KdbHost' );
const { Query } = require('./orm/Query');

module.exports= {
    URLquery: URLquery,
    store: defs,
    StoreHost: StoreHost,
    Query: Query,
    

    // KDB
    KdbStoreHost: KdbStoreHost
};