/**Test for case study of align
 * The source is a json data
 * 
 * NOT WORKING change require paths
 * 
 * @usage
 *  VSCode run and debug: Debug Mocha Test
 * 
 * or
 * 
 *  cd examples/dbapp
 *  mocha align/test/align.test.js  
 *  
 * With coverage:
 *  npx nyc --reporter=text mocha align/test/align.test.js 
 */
const { CompareHelper } = require("../../../../src/orm/CompareHelper");
const assert = require("assert");
const { FakeQuery } = require("../../../../test/entity-rel/FakeQuery");

const CustomerSource = require("../skel/Customer");

require("../../test/_test-setup");

const CustomerDest = require('../../models/Customer');
const Log = require('../../models/Log');
const Aligner = require('../skel/Aligner');
const { IAlignBuffer } = require('../../../../src/orm/IAlignBuffer');
const ThresholdBuffer = require('../skel/ThresholdBuffer')

const { compareSortedSource } = require("../../../../test/entity-rel/skelData/compareSortedData/sourceData")
const { compareSortedSourceMoreRecords } = require("../../../../test/entity-rel/skelData/compareSortedData/sourceDataMoreRecords")
const { compareSortedDest } = require("../../../../test/entity-rel/skelData/compareSortedData/destData")
const { compareSortedDestMoreRecords } = require("../../../../test/entity-rel/skelData/compareSortedData/destDataMoreRecords")
const { compareSortedSourcePaging } = require("../../../../test/entity-rel/skelData/compareSortedData/sourceDataPaging")
const { compareSortedDestPaging } = require("../../../../test/entity-rel/skelData/compareSortedData/destDataPaging");



describe("Align test", function () {
    const parameters = {
        columnMap: (rec) => ({ name: rec.name, address: rec.address })
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
        entity: CustomerSource,
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

    const localSourceArrayQuery = CustomerSource.select();
    const localDBDestQuery = CustomerDest.select();

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

    // it("use a json as source", async function () {
    //     //const parameters = {};
    //     //localFakeSourceQuery.recordSet = compareSortedSource;

    //     //localFakeDestQuery.recordSet = compareSortedDest;
    //     parameters.sourcePageSize=50;
    //     parameters.destPageSize=50;

    //     let actions = {
    //         // aggiungere il parametro result per le statistiche
    //         handleValueDifferent: (entity, values) => {
    //             //assert(values.name === 'UpdateHere')
    //             return Promise.resolve(true);
    //         } ,
    //         handleNotInSource: (entity, record) => {
    //             // console.log(`executing delete for record with id ${record?.id}`);
    //             //assert(record.id === 3);
    //            return Promise.resolve(true);
    //         },
    //         handleNotInDestination: (entity, record) => {
    //             // console.log(`executing insert for record with id ${record?.id}`);
    //             //assert(record.id === 5);
    //             return Promise.resolve(true);
    //         },

    //     };

    //     let out = await CompareHelper.compareSorted(
    //         localSourceArrayQuery, localDBDestQuery, parameters, undefined, actions);

    //     assert(out);

    //     await Log.insert( {
    //         what: `The test precedure has ended `,
    //         activity_type: `align-customer`
    //     } );

    //     const logs = await Log.select().exec();

    //     console.log( logs );
    // });

    it("use a buffer", async function () {
        //const parameters = {};
        //localFakeSourceQuery.recordSet = compareSortedSource;

        //localFakeDestQuery.recordSet = compareSortedDest;
        parameters.sourcePageSize = 50;
        parameters.destPageSize = 50;

        // const buffer = new IAlignBuffer();
        const MyBuffer = class extends IAlignBuffer {
            //    const MyBuffer = class extends ThresholdBuffer {
            update(entity, values, keys) {
                assert(keys === 1 || keys === 2)
                //   assert(false)
                return Promise.resolve(true);
            }
            delete(entity, record) {
                // console.log(`executing delete for record with id ${record?.id}`);
                assert(false);
                return Promise.resolve(true);
            }
            insert(entity, record) {
                // console.log(`executing insert for record with id ${record?.id}`);
                assert(record.id === 7 || record.id === 8 || record.id === 9 || record.id === 10);
                return Promise.resolve(true);
            }
        }
        let buffer = new MyBuffer();

        localSourceArrayQuery.dataStorage.data[0].name = 'change1'
        localSourceArrayQuery.dataStorage.data[1].address = 'change2'


        let out = await CompareHelper.compareSorted(
            localSourceArrayQuery, localDBDestQuery, parameters, undefined, buffer);


        // let out = await CompareHelper.alignSorted(
        //     localSourceArrayQuery, localDBDestQuery, parameters, buffer );

        assert(out);

        await Log.insert({
            what: `Test "use a buffer" has ended`,
            activity_type: `align-customer`
        });

        const logs = await Log.select().exec();

        console.log(logs);
    });

    it("use a Threshold buffer", async function () {
        //const parameters = {};
        //localFakeSourceQuery.recordSet = compareSortedSource;

        //localFakeDestQuery.recordSet = compareSortedDest;
        parameters.sourcePageSize = 50;
        parameters.destPageSize = 50;

        const MyBuffer = class extends ThresholdBuffer {
            async update(entity, values, keys) {
                assert(keys === 1 || keys === 2)
                //   assert(false)
                await super.update(entity, values, keys);
            }

        }
        let buffer = new MyBuffer();
        //let buffer = new ThresholdBuffer();

        localSourceArrayQuery.dataStorage.data[0].name = 'change1'
        localSourceArrayQuery.dataStorage.data[1].address = 'change2'

        let before = await CustomerDest.select().where(CustomerDest.id.in([1, 2])).exec();

        let out = await CompareHelper.compareSorted(
            localSourceArrayQuery, localDBDestQuery, parameters, undefined, buffer);


        // let out = await CompareHelper.alignSorted(
        //     localSourceArrayQuery, localDBDestQuery, parameters, buffer );
        let after = await CustomerDest.select().where(CustomerDest.id.in([1, 2])).exec();

        assert(out);

        await Log.insert({
            what: `Test 'use a Threshold buffer' has ended`,
            activity_type: `align-customer`
        });

        const logs = await Log.select().exec();

        // TODO: assert check instead of console.log
        console.log(logs);
    });


    // it("use Aligner helper", async function () {
    //     //const parameters = {};
    //     //localFakeSourceQuery.recordSet = compareSortedSource;

    //     //localFakeDestQuery.recordSet = compareSortedDest;
    //     parameters.sourcePageSize=50;
    //     parameters.destPageSize=50;

    //     let actions = {
    //         // aggiungere il parametro result per le statistiche
    //         handleValueDifferent: (entity, values) => {
    //             //assert(values.name === 'UpdateHere')
    //             return Promise.resolve(true);
    //         } ,
    //         handleNotInSource: (entity, record) => {
    //             // console.log(`executing delete for record with id ${record?.id}`);
    //             //assert(record.id === 3);
    //            return Promise.resolve(true);
    //         },
    //         handleNotInDestination: (entity, record) => {
    //             // console.log(`executing insert for record with id ${record?.id}`);
    //             //assert(record.id === 5);
    //             return Promise.resolve(true);
    //         },

    //     };

    //     let out = await Aligner.run( "flow-name",
    //         localSourceArrayQuery, localDBDestQuery, parameters, undefined, actions);

    //     assert(out);

    //     const logs = await Log.select().exec();

    //     console.log( logs );
    // });

});