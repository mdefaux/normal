
const store = require( './store' );
const Site = require( './Site' );

const Customer = store.entity( 'Customer', (model) => {

    model.source( 'customer' );

    model.label( 'name' );

    model.string( 'name' );
    model.string( 'address' );
    model.string( 'reference' );
    model.number( 'telephone' );

    model.many( 'sites', {
        modelClass: "Site",
        join: {
            from: 'id',
            to: 'customer_id'
        }
    });
} );


module.exports = Customer;