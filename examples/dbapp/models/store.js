/**File: models/store.js
 * Creates a store, a collection of all models.
 * In this example a Knex db store is used.
 */

// includes the normaly store and the knex store
const { store, KdbStoreHost } = require("normaly");
// includes your knex connection definition 
const knex = require( '../db/knex' );

// Initializes store with your knex db connection
store.setup( new KdbStoreHost( knex ) );

// exports the store object
module.exports = store;