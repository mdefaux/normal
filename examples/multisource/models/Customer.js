
var store = require( './store' );
const dataStorage = require( '../db/data_storage' );


module.exports = store.entity( 'Customer', (model) => {

    model.source( 'customer' );

    model.label( 'name' );

    model.string( 'name' );
    model.string( 'address' );
    model.string( 'reference' );
    model.number( 'telephone' );

    model.storageData( dataStorage );
} );
