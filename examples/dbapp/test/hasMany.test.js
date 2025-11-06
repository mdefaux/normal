
const assert = require( "assert" );
const Customer = require( "../models/Customer.js" );
const Site = require( "../models/Site.js" );


describe( "Has many relation", function () {
    // it( "query Customer with related Sites", async function () {
    //     assert( Customer.metaData.name === 'Customer' );
    //     const customer = await Customer.query().withGraphFetched('sites');
    //     assert( customer.sites.length > 0 );
    // });
    // it( "query Site with related Customer", async function () {
    //     assert( Site.metaData.name === 'Site' );
    //     const site = await Site.query().withGraphFetched('customer');
    //     assert( site.customer.id > 0 );
    // });
    it( "define has many relation between Customer and Site", async function () {
        assert( Customer.metaData.name === 'Customer' );
        assert( Site.metaData.name === 'Site' );
        assert( Customer.metaData.model.fields.sites instanceof Object );

        assert(Customer.metaData.model.fields.sites.toEntityName === 'Site');
        // assert(Site.metaData.model.fields.Customer.toEntityName === 'Customer');
    });
    it.skip( "query Customers and their Sites", async function () {

        assert( Customer.sites instanceof Object );

        const customerQuery = Customer.select().withRelated( Customer.sites );

        assert( customerQuery instanceof Object );
        assert( customerQuery.manyRelateds instanceof Object );
        assert( customerQuery.manyRelateds[ 'sites' ] instanceof Object );
        assert( customerQuery.manyRelateds[ 'sites' ].toEntityName === 'Site' );

        const customers = await customerQuery.exec();
        assert( customers.length > 0 );
        customers.forEach( customer => {
            assert( Array.isArray( customer.sites ) );
        } );
    } );
});