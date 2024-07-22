/**Setups askeleton Entity that takes data form a json file
 * 
 */
var store = require( './store' );
const data = require('./site.ext.json');

// sets a data storage named as desiderd table
const dataStorage = store.data( "site", data ); 

// setups an entity that has storage set to point to "Site" data
const SiteExt = store.entity( 'SiteExt', (model) => {

    model.source( 'site' );

    model.string( 'address' );
    model.label( 'address' );
    model.string( 'customer_id' );

    // tells model that data is taken from dataStorage previously declared
    model.storageData( dataStorage );
} );

module.exports = SiteExt;
