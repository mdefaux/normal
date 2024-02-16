/**Test for CompareHelper
 * 
 * @usage
 *  mocha test/entity-rel/compareHelper.test.js 
 *  
 * With coverage:
 *  npx nyc --reporter=text mocha test/entity-rel/compareHelper.test.js
 */
const { CompareHelper } = require("../../src/orm/CompareHelper");
// const Customer = require("../skel/Customer");
const assert = require( "assert" );


describe( "CompareHelper test", function () {

    // Stub Entity
    const Customer = {
        metaData: {
            model: {
                fields: {
                    name: { equalValues: (a,b) => (a === b) },
                    address: { equalValues: (a,b) => (a === b) },
                }
            }
        },
        id: {
            in( keyToFind ) {
                assert( keyToFind );
                return true;
            }
        }
    };
    
    const sourceQuery = {
        page( c, sp ) {
            assert( c === null || !isNaN( c ) );
            assert( !isNaN( sp ) );
        },
        async exec() {
            return [];
        }
    };

    const destQuery = {
        entity: Customer,
        clone() { return this; },
        page( c, sp ) {
            assert( c === null || !isNaN( c ) );
            assert( !isNaN( sp ) );
        },
        where( condition ) {
            assert( condition );
            return this;
        },
        andWhere( condition ) {
            assert( condition !== undefined );
            return this;
        },
        async exec() {
            return [];
        },
        id: {
            in( keyToFind ) {
                assert( keyToFind );
                return true;
            },
            notIn( arr ) {
                assert( Array.isArray( arr ) );
                return true;
            }
        }
    };

    describe( "compareColumns method", function () {
        
        // Stub Entity
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
    describe( "compareChunk test", function () {
         //
        it( "template_test", async function () {

            let accumulator = { 
                notInSource: {},
                notInDest: {},
                match: {},
                diff: {},
                duplicateKeys: [],
                destEntity: destQuery.entity,
                sourceEnd: false
            }
            const parameters = {};
            const chunk = 0;
            
            let out = await CompareHelper.compareChunk( 
                accumulator, sourceQuery, destQuery, parameters, chunk );

            assert( out );
        });
    });

    // copy and uncomment to create a new test
    describe( "compare test", function () {
         //
        it( "compare test", async function () {
            const parameters = {};

            let out = await CompareHelper.compare( 
                sourceQuery, destQuery, parameters );

            assert( out );
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
