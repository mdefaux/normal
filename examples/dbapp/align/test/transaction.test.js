/**Performance comparison between a cycle of 128 update
 * and a transaction with 128 updates.
 *
 * 1. without transaction cycling each: 1984ms, 1917ms, 1894ms, 1757ms, 1907ms ~ 2s
 * 2. with transaction using .map():     557ms,  512ms,  418ms,  488ms,  490ms ~ 0.5s
 * 3. with transaction using .forEach(): 401ms,  438ms,  361ms,  425ms,  452ms ~ 0.45s
 *
 * Conclusion: transaction is 4 times faster than a cycle of updates.
 *
 * Note: the transaction is not working with sqlite3
 * (XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX)
 *
 * 
 */
const assert = require("assert");
require("../../test/_test-setup");

const Customer = require('../../models/Customer');

describe("Transaction test", function () {

    it("without transaction", async function () {

        let data = await Customer.select().setRange( 5000 ).exec();

        for( let r of data ) {
            await Customer.update( r.id, { address: 'via Garibaldi 20, Besana' } );
        }
        assert( true );
    });

    it("with transaction using .forEach()", async function () {

        let data = await Customer.select().setRange( 5000 ).exec();

        await Customer.host.transaction(trx => {
            const queries = [];
            data.forEach(r => {
                const query = Customer.host.createUpdate( Customer )
                    .transacting(trx)
                    .value( r.id, { name: 'via Tristram, Calvatone' } )
                    .exec(); // executes the update

                queries.push(query);
            });
        
            return Promise.all(queries) // Once every query is written
                .then(trx.commit)       // We try to execute all of them
                .catch(trx.rollback);   // And rollback in case any of them goes wrong
        });

        assert( true );
    });

    it("with transaction using .map()", async function () {

        let data = await Customer.select().setRange( 5000 ).exec();

        await Customer.host.transaction(trx => {
            const queries = data.map(r => {
                return Customer.host.createUpdate( Customer )
                    .transacting(trx)
                    .value( r.id, { name: 'via Tristram, Calvatone' } )
                    .exec();            // executes the update
            });
        
            return Promise.all(queries) // Once every query is written
                .then(trx.commit)       // We try to execute all of them
                .catch(trx.rollback);   // And rollback in case any of them goes wrong
        });

        assert( true );
    });

});
