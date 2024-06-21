/**Setups askeleton Entity that takes data form a json file
 * 
 */
var store = require( './store' );
const data = require('./Customer.data.json');

// sets a data storage named as desiderd table
const dataStorage = store.data( "customer", data ); 

// setups an entity that has storage set to point to "Customer" data
const CustomerExt = store.entity( 'CustomerExt', (model) => {

    model.source( 'customer' );

    model.string( 'name' );
    model.label( 'name' );
    model.string( 'address' );
    model.string( 'reference' );
    model.number( 'telephone' );

    // tells model that data is taken from dataStorage previously declared
    model.storageData( dataStorage );
} );

module.exports = CustomerExt;
