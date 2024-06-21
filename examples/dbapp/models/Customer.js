
var store = require( './store' );


const Customer = store.entity( 'Customer', (model) => {

    model.source( 'customer' );

    model.label( 'name' );

    model.string( 'name' );
    model.string( 'address' );
    model.string( 'reference' );
    model.number( 'telephone' );

} );


module.exports = Customer;