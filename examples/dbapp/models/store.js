/**File: models/store.js
 * Creates a store, a collection of all models.
 * In this example a Knex db store is used.
 */

// includes the normaly store and the knex store
import { store, KdbStoreHost } from 'normaly'
// includes your knex connection definition 
import knex from 'knex'

// Initializes store with your knex db connection
store.setup(new KdbStoreHost(knex));

// exports the store object
export default store;