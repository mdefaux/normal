
const store = require( './store' );
// const Site = require( './Site' );

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
            to: 'Customer',
            where:  ( Site, params ) => (Site.address.notNull())
        },
        // def: ( Site ) => ({
        //     join: {
        //         from: Customer.id,
        //         to: Site.Customer,
        //         condition: Site.address.notNull()
        //     },
        // })
    });
} );


module.exports = Customer;