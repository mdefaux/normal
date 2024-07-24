const defs = require('./ForteORM');
const {StoreHost} = require( './orm/StoreHost' )
const {URLquery} = require( './url_query' );

const {KdbStoreHost} = require( './orm/kdbhost/KdbHost' );
const { Query } = require('./orm/Query');
const { CompareHelper } = require("./orm/CompareHelper");
const  { IAlignBuffer }  = require("./orm/IAlignBuffer");
const { ILogger } = require("./orm/ILogger");
const ThresholdBuffer = require("./orm/ThresholdBuffer");

module.exports= {
    URLquery: URLquery,
    store: defs,
    StoreHost: StoreHost,
    Query: Query,
    CompareHelper: CompareHelper,
    IAlignBuffer: IAlignBuffer,
    ILogger: ILogger,
    ThresholdBuffer: ThresholdBuffer,
    

    // KDB
    KdbStoreHost: KdbStoreHost
};