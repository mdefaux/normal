/**Test for CompareHelper
 * 
 * @usage
 *  mocha test/entity-rel/compareHelper.test.js 
 */
const { CompareHelper } = require("../../src/orm/CompareHelper");
const Customer = require("../skel/Customer");
const assert = require( "assert" );


describe( "CompareHelper test", function () {

    describe( "compareColumns method", function () {
        
        const Customer = {
            metaData: {
                model: {
                    fields: {
                        name: { equalValues: (a,b) => (a === b) },
                        address: { equalValues: (a,b) => (a === b) },
                    }
                }
            }
        }
        // 
        it( "same record", function () {
            const sourceRec = {
                name: 'Agenore Srl', address: 'quiz street'
            };
            const destRec = sourceRec;

            const columnMap = ( rec ) => ( rec );

            let result = CompareHelper.compareColumns( 
                sourceRec, destRec, {columnMap:columnMap}, Customer );

            // expected 'false' as records has no difference
            assert( !result );
        });
        // 
        it( "name differs", function () {
            const sourceRec = {
                name: 'Agenore Srl', address: 'quiz street'
            };
            const destRec = {
                name: 'Bambooooo Srl', address: 'quiz street'
            };

            const columnMap = ( rec ) => ( rec );

            let result = CompareHelper.compareColumns( 
                sourceRec, destRec, {columnMap:columnMap}, Customer );

            // expected 'false' as records has no difference
            assert( result.differentColumns.length === 1 );
            assert( result.differentColumns[0] === "name" );
            assert( result.newValues.name === "Agenore Srl" );
            assert( result.oldValues.name === "Bambooooo Srl" );
        });
    });

    // copy and uncomment to create a new test
    // describe( "template_descriptor", function () {
    //      //
    //     it( "template_test", function () {
    //         assert( defs.mainHost instanceof StoreHost );
    //     });
    // });
});
