
const assert = require("assert");
require("../../test/_test-setup");

const Customer = require('../../models/Customer');

describe("Transaction test", function () {

    it("use a buffer", async function () {

        let data = await Customer.select().setRange( 5000 ).exec();

        for( let r of data ) {
            await Customer.update( r.id, { address: 'via Garibaldi 20, Besana' } );
        }

        console.log( data.length );
    });

    it("use a buffer", async function () {

        let data = await Customer.select().setRange( 5000 ).exec();

        await Customer.host.transaction(trx => {
            const queries = [];
            data.forEach(r => {
                const query = Customer.host.createUpdate( Customer )
                    .transacting(trx)
                    .value( r.id, { name: 'via Tristram, Calvatone' } ).exec(/* returning */); // executes the update

                // const query = Customer.update( r.id, { address: 'via Garibaldi 20, Besana' } )
                //     .exec(); // This makes every update be in the same transaction
                queries.push(query);
            });
        
            return Promise.all(queries) // Once every query is written
                .then(trx.commit) // We try to execute all of them
                .catch(trx.rollback); // And rollback in case any of them goes wrong
        });

        console.log( data.length );

        // Customer.host.transaction(async () => {
        //     let customer = new Customer();
        //     customer.name = "John";
        //     customer.age = 30;
        //     await customer.save();
        // });


    });

});
