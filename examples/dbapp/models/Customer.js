
var store = require( './store' );



module.exports = store.entity( 'Customer', (model) => {

    model.source( 'customer' );

    model.label( 'name' );

    model.string( 'name' );
    model.string( 'address' );
    model.string( 'reference' );
    model.number( 'telephone' );
} );
