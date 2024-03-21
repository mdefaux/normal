/**Test for case study of align
 * The source is a json data
 * 
 * NOT WORKING change require paths
 * 
 * @usage
 *  mocha test/entity-rel/compareSorted.test.js 
 *  
 * With coverage:
 *  npx nyc --reporter=text mocha test/entity-rel/compareSorted.test.js
 */
const { CompareHelper } = require("../../../src/orm/CompareHelper");
const assert = require("assert");
const { FakeQuery } = require("../../../test/entity-rel/FakeQuery");
const Customer2 = require("../skel/Customer");

const { compareSortedSource } = require("../../../test/entity-rel/skelData/compareSortedData/sourceData")
const { compareSortedSourceMoreRecords } = require("../../../test/entity-rel/skelData/compareSortedData/sourceDataMoreRecords")
const {compareSortedDest} = require("../../../test/entity-rel/skelData/compareSortedData/destData")
const {compareSortedDestMoreRecords} = require("../../../test/entity-rel/skelData/compareSortedData/destDataMoreRecords")
const {compareSortedSourcePaging } = require("../../../test/entity-rel/skelData/compareSortedData/sourceDataPaging")
const {compareSortedDestPaging} = require("../../../test/entity-rel/skelData/compareSortedData/destDataPaging")



describe("Align test", function () {
    const parameters = {
        columnMap: (rec) => ({name: rec.name})
    };
    const Customer = {
        metaData: {
            model: {
                fields: {
                    name: { equalValues: (a, b) => (a === b) },
                    address: { equalValues: (a, b) => (a === b) },
                }
            }
        },
        id: {
            in(keyToFind) {
                assert(keyToFind);
                //return true;
                return {
                    in: keyToFind,
                    f: (e) => (keyToFind.indexOf(e.id) >= 0)
                };
            }
        }
    };

    const sourceQuery = {
        page(c, sp) {
       //     assert(c === null || !isNaN(c));
         //   assert(!isNaN(sp));
         return this;
        },
        async exec() {
            return [];
        }
    };

    const destQuery = {
        entity: Customer2,
        clone() { return this; },
        page(c, sp) {
            assert(c === null || !isNaN(c));
            assert(!isNaN(sp));
        },
        where(condition) {
            assert(condition);
            return this;
        },
        andWhere(condition) {
            assert(condition !== undefined);
            return this;
        },
        async exec() {
            return [];
        },
        id: {
            in(keyToFind) {
                assert(keyToFind);
                return true;
            },
            notIn(arr) {
                assert(Array.isArray(arr));
                return true;
            }
        }
    };



    const localCustomer = {
        ...Customer,
        metaData: {
            model: {
                fields: {
                    ...Customer.metaData.model.fields,
                    id: { equalValues: (a, b) => (a === b) },
                    //address: { equalValues: (a,b) => (a === b) },
                }
            }
        },
        insert(record) {
            assert(record[0].id === 5);
            return Promise.resolve(record);
        },
        update(id, values) {
            assert(id === 2);
            assert(values.name === 'UpdateHere');
            let result = {
                ...values,
                id: id
            }
            return Promise.resolve(result);
        },
        delete(records) {
            assert(records[0].id === 3);
            return Promise.resolve(records);
        }

    };

    const localSourceQuery = {
        ...sourceQuery,
        async exec() {
            return [
                {
                    id: 1,
                    name: "nome1",
                    address: "via nome1",
                },
                {
                    id: 2,
                    name: "UpdateHere",
                    address: "via Update",
                },
                {
                    id: 5,
                    name: "InsertHere",
                    address: "via Insert",
                },
            ];
        }
    };

    const localSourceArrayQuery = Customer2.select();

    const localFakeSourceQuery = new FakeQuery();


    const localFakeDestQuery = new FakeQuery();
    localFakeDestQuery.entity = localCustomer;
    localFakeDestQuery.recordSet = [
        {
            id: 1,
            name: "nome1",
            address: "via nome1",
        },
        {
            id: 2,
            name: "oldValue",
            address: "via Update",
        },
        {
            id: 3,
            name: "toDelete",
            address: "via Delete",
        },
    ];
    localFakeDestQuery.id = {
        in(keyToFind) {
            assert(keyToFind);
            return {
                in: keyToFind,
                f: (e) => (keyToFind.indexOf(e.id) >= 0)
            };
        },
        notIn(keyToFind) {
            assert(Array.isArray(keyToFind));
            return {
                notIn: keyToFind,
                f: (e) => (
                    keyToFind.indexOf('' + e.id) < 0
                )
            };
        }
    };
/*
    it("alignSorted test", async function () {
        //const parameters = {};

       // let out = await CompareHelper.compareSorted(
        let out = await CompareHelper.alignSorted(
            localSourceQuery, localFakeDestQuery, parameters);

        assert(out);
    });*/

    it("use a json as source", async function () {
        //const parameters = {};
        //localFakeSourceQuery.recordSet = compareSortedSource;
        localFakeDestQuery.recordSet = compareSortedDest;
        parameters.sourcePageSize=1;
        parameters.destPageSize=3;

        let actions = {
            // aggiungere il parametro result per le statistiche
            handleValueDifferent: (entity, values) => {
                assert(values.name === 'UpdateHere')
                return Promise.resolve(true);
            } ,
            handleNotInSource: (entity, record) => {
                // console.log(`executing delete for record with id ${record?.id}`);
                assert(record.id === 3);
               return Promise.resolve(true);
            },
            handleNotInDestination: (entity, record) => {
                // console.log(`executing insert for record with id ${record?.id}`);
                assert(record.id === 5);
                return Promise.resolve(true);
            },

        };

        let out = await CompareHelper.compareSorted(
            localSourceArrayQuery, localFakeDestQuery, parameters, undefined, actions);

        assert(out);
    });

    /* it("compareSorted test, source with more records", async function () {
        //const parameters = {};
        localFakeSourceQuery.recordSet = compareSortedSourceMoreRecords;
        localFakeDestQuery.recordSet = compareSortedDest;

        let actions = {
            // aggiungere il parametro result per le statistiche
            handleValueDifferent: (entity, values) => {
                
                assert(false)
                return Promise.resolve(true);
            } ,
            handleNotInSource: (entity, record) => {
                // console.log(`executing delete for record with id ${record?.id}`);
                assert(false);
               return Promise.resolve(true);
            },
            handleNotInDestination: (entity, record) => {
                // console.log(`executing insert for record with id ${record?.id}`);
                assert(record.id === 7 || record.id === 8 || record.id === 9  || record.id === 10 );
                return Promise.resolve(true);
            },

        };

        let out = await CompareHelper.compareSorted(
            localFakeSourceQuery, localFakeDestQuery, parameters, undefined, actions);

        assert(out);
    });


    it("compareSorted test, dest with more records", async function () {
        //const parameters = {};
        localFakeSourceQuery.recordSet = compareSortedSource;
        localFakeDestQuery.recordSet = compareSortedDestMoreRecords;

        let actions = {
            // aggiungere il parametro result per le statistiche
            handleValueDifferent: (entity, values) => {
                
                assert(false)
                return Promise.resolve(true);
            } ,
            handleNotInSource: (entity, record) => {
                // console.log(`executing delete for record with id ${record?.id}`);
                assert(record.id === 100 || record.id === 101 || record.id === 102 ||record.id === 103 );
               return Promise.resolve(true);
            },
            handleNotInDestination: (entity, record) => {
                // console.log(`executing insert for record with id ${record?.id}`);
                assert(false);
                return Promise.resolve(true);
            },

        };

        let out = await CompareHelper.compareSorted(
            localFakeSourceQuery, localFakeDestQuery, parameters, undefined, actions);

        assert(out);
    });


    it("compareSorted test paging,  source with more record than dest", async function () {
        //const parameters = {};
        localFakeSourceQuery.recordSet = compareSortedSourcePaging; 
        localFakeDestQuery.recordSet = compareSortedDest; 
        parameters.sourcePageSize=2;

        let actions = {
            // aggiungere il parametro result per le statistiche
            handleNotInDestination: (entity, record) => {
                // console.log(`executing delete for record with id ${record?.id}`);
                assert(record.id === 8 || record.id === 9);
                return Promise.resolve(true);
            },

        };

        let out = await CompareHelper.compareSorted(
            localFakeSourceQuery, localFakeDestQuery, parameters, undefined, actions);

        assert(out);
    });

   
    it("compareSorted test paging,  dest with more record than source", async function () {
        //const parameters = {};
        localFakeSourceQuery.recordSet = compareSortedSource; 
        localFakeDestQuery.recordSet = compareSortedDestPaging; 
        parameters.destPageSize=5;

        let actions = {
            // aggiungere il parametro result per le statistiche
        handleNotInSource: (entity, record) => {
                // console.log(`executing insert for record with id ${record?.id}`);
                assert(record.id===8 || record.id===9);
                return Promise.resolve(true);
            },
            

        };

        let out = await CompareHelper.compareSorted(
            localFakeSourceQuery, localFakeDestQuery, parameters, undefined, actions);

        assert(out);
    }); */
});