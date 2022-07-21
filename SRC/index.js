const defs = require('./ForteORM');
const StoreHost = require( './orm/StoreHost' )
const {URLquery} = require( './url_query' );

const {KdbStoreHost} = require( './orm/kdbhost/KdbHost' );

module.exports= {
    URLquery: URLquery,
    store: defs,
    StoreHost: StoreHost,

    // KDB
    KdbStoreHost: KdbStoreHost
};