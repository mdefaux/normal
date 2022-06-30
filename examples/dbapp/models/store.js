const { store, StoreHost } = require("normalize");

store.setup( new StoreHost() );

// Initializes store with your knex db connection
// const knex = require( '../db/knex.js' );
// store.setup( new KdbStoreHost( knex ) );

exports.default = store;
