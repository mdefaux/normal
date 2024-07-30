/**Test for case study of align
 * The source is a json data
 * 
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
const assert = require("assert");
require("../../test/_test-setup");

const { CompareHelper } = require("../../../../src/orm/CompareHelper");
const Log = require('../../models/Log');
const { IAlignBuffer } = require('../../../../src/orm/IAlignBuffer');
const ThresholdBuffer = require('../helpers/ThresholdBuffer');
const Aligner = require('../helpers/Aligner');

const CustomerSource = require("../data/Customer");
const Customer = require('../../models/Customer');



describe("Align test", function () {
    const parameters = {
        columnMap: (rec) => ({ name: rec.name, address: rec.address })
    };

    const localSourceArrayQuery = CustomerSource.select();
    const localDBDestQuery = Customer.select();


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

        let before = await Customer.select().where(Customer.id.in([1, 2])).exec();

        let out = await CompareHelper.compareSorted(
            localSourceArrayQuery, localDBDestQuery, parameters, undefined, buffer);


        // let out = await CompareHelper.alignSorted(
        //     localSourceArrayQuery, localDBDestQuery, parameters, buffer );
        let after = await Customer.select().where(Customer.id.in([1, 2])).exec();

        assert(out);

        await Log.insert({
            what: `Test 'use a Threshold buffer' has ended`,
            activity_type: `align-customer`
        });

        const logs = await Log.select().exec();

        // TODO: assert check instead of console.log
        console.log(logs);
    });



    it("use a transaction for updates", async function () {
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

        let before = await Customer.select().where(Customer.id.in([1, 2])).exec();

        let out = await CompareHelper.compareSorted(
            localSourceArrayQuery, localDBDestQuery, parameters, undefined, buffer);


        // let out = await CompareHelper.alignSorted(
        //     localSourceArrayQuery, localDBDestQuery, parameters, buffer );
        let after = await Customer.select().where(Customer.id.in([1, 2])).exec();

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