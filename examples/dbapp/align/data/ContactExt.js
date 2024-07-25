/**Setups askeleton Entity that takes data form a json file
 * 
 */
var store = require( './store' );
const data = require('./sito_esempio.json');


// sets a data storage named as desiderd table
const dataStorage = store.data( "contact", data ); 

// setups an entity that has storage set to point to "Sito" data
const ContactExt = store.entity( 'ContactExt', (model) => {

    model.source( 'contact' );

    model.string( 'code' );
    model.label( 'code' );
    model.string( 'customer_id' );
    model.string( 'address' );
    model.string( 'progr' );
    model.string( 'device_model_id' );

    // tells model that data is taken from dataStorage previously declared
    model.storageData( dataStorage );
} );

module.exports = ContactExt;
