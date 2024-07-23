/**Setups askeleton Entity that takes data form a json file
 * 
 */
var store = require( './store' );
const data = require('./sito_esempio.json');


// sets a data storage named as desiderd table
const dataStorage = store.data( "sito", data ); 

// setups an entity that has storage set to point to "Sito" data
const SitoExt = store.entity( 'SitoExt', (model) => {

    model.source( 'sito' );

    model.string( 'serial_number' );
    model.label( 'serial_number' );
    model.string( 'ip_address' );
    model.string( 'device_model_id' );
    model.string( 'site_id' );
    model.string( 'customer_id' );

    // tells model that data is taken from dataStorage previously declared
    model.storageData( dataStorage );
} );

module.exports = SitoExt;
