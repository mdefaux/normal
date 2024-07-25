
var store = require( './store' );


const Contact = store.entity( 'Contact', (model) => {

    model.source( 'contact' );

    model.string( 'code' );
    model.label( 'code' );
    model.string( 'customer_id' );
    model.string( 'address' );
    model.string( 'progr' );

} );


module.exports = Contact;