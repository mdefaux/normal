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
//const assert = require("assert");
const {assert} = require("chai");
const {expect} = require("chai");
require("../../test/_test-setup");
var knex = require('../../db/knex'); 

const { CompareHelper } = require("../../../../src/orm/CompareHelper");
const Log = require('../../models/Log');
const { IAlignBuffer } = require('../../../../src/orm/IAlignBuffer');
// const ThresholdBuffer = require('../helpers/ThresholdBuffer');
const ThresholdBuffer = require('../../../../src/orm/ThresholdBuffer');
const Aligner = require('../helpers/Aligner');

const CustomerSource = require("../data/Customer");
const Customer = require('../../models/Customer');


describe("Align test", function () {
    
    const parameters = {
        columnMap: (rec) => ({ name: rec.name, address: rec.address })
    };

    const localSourceArrayQuery = CustomerSource.select();
    const localDBDestQuery = Customer.select();


 /*    it("use a buffer", async function () {
        //const parameters = {};
        //localFakeSourceQuery.recordSet = compareSortedSource;

        //localFakeDestQuery.recordSet = compareSortedDest;
        parameters.sourcePageSize = 50;
        parameters.destPageSize = 50;

        let fail = 0;

        // const buffer = new IAlignBuffer();
        const MyBuffer = class extends IAlignBuffer {
            //    const MyBuffer = class extends ThresholdBuffer {
            update(entity, values, keys) {
                assert(keys === 1 || keys === 2 || keys === 52 || keys === 53)
                //   assert(false)
                return Promise.resolve(true);
            }
            async delete(entity, record) {
                // console.log(`executing delete for record with id ${record?.id}`);
                //assert(false);
                assert(record.id === 6 || record.id === 7 || record.id === 31 || record.id === 32 || record.id === 33);
                await entity.delete(record.id);
                return Promise.resolve(true);
            }
            async insert(entity, record) {
                // console.log(`executing insert for record with id ${record?.id}`);
                //assert(record.id === 7 || record.id === 8 || record.id === 9 || record.id === 10);
                //assert(record.id === 5000 || record.id === 5001);
                //assert.fail("Insert found; should not insert any record!!!");
                fail = 1;
                // assert(1 === 0);
                //assert.equal(record,undefined );
                await entity.insert(record);
                return Promise.resolve(true);
            }
        }
        let buffer = new MyBuffer();

        localSourceArrayQuery.dataStorage.data[0].name = 'change1'
        localSourceArrayQuery.dataStorage.data[1].address = 'change2'
        localSourceArrayQuery.dataStorage.data[51].address = 'change3'
        localSourceArrayQuery.dataStorage.data[52].address = 'change4'

        // remove some elements from source Array
        localSourceArrayQuery.dataStorage.data.splice(5, 2);
        localSourceArrayQuery.dataStorage.data.splice(30, 3);

        // let newElement1 = {
        //     "id":5000,"name":"toInsertPage1_1","address":"asdfasdf","email":"asdfasdf@asdfadf.co.uk","reference":"Marco Shorland","telephone":"539-295-8061"};

        // let newElement2 = {
        //     "id":5001,"name":"toInsertPage1_2","address":"asdfasdf","email":"asdfasdf@asdfadf.co.uk","reference":"Marco Shorland","telephone":"539-295-8061"};

        // localSourceArrayQuery.dataStorage.data.splice(5, 0, newElement1, newElement2);

        let out = await CompareHelper.compareSorted(
            localSourceArrayQuery, localDBDestQuery, parameters, undefined, buffer);


        // let out = await CompareHelper.alignSorted(
        //     localSourceArrayQuery, localDBDestQuery, parameters, buffer );
        expect(fail).to.equal(0);
        assert(out);

        await Log.insert({
            what: `Test "use a buffer" has ended`,
            activity_type: `align-customer`
        });

        const logs = await Log.select().exec();

        console.log(logs);
    }); */

    it("use a Threshold buffer, delete and update only", async function () {
        //const parameters = {};
        //localFakeSourceQuery.recordSet = compareSortedSource;

        //localFakeDestQuery.recordSet = compareSortedDest;
        parameters.sourcePageSize = 50;
        parameters.destPageSize = 50;

        let fail = 0;

        const MyBuffer = class extends ThresholdBuffer {
            async update(entity, values, keys) {
                assert(keys === 1 || keys === 2 || keys === 52 || keys === 53)
                //   assert(false)
                await super.update(entity, values, keys);
            }
            async delete(entity, record) {
                assert(record.id === 6 || record.id === 7 || record.id === 31 || record.id === 32 || record.id === 33
               || record.id === 221 || record.id === 405 || record.id === 451 || record.id === 452);
                await super.delete(entity, record)
            }
            async insert(entity, record) {
                fail = 1;
          //     assert(record.name === "Skiptube"); 
               await super.insert(entity, record);
            }

        }
        let buffer = new MyBuffer();
        //let buffer = new ThresholdBuffer();

        localSourceArrayQuery.dataStorage.data[0].name = 'change1'
        localSourceArrayQuery.dataStorage.data[1].address = 'change2'
        localSourceArrayQuery.dataStorage.data[51].address = 'change3'
        localSourceArrayQuery.dataStorage.data[52].address = 'change4'

        localSourceArrayQuery.dataStorage.data.splice(30, 3);
        localSourceArrayQuery.dataStorage.data.splice(5, 2);
        localSourceArrayQuery.dataStorage.data.splice(215, 1);
        localSourceArrayQuery.dataStorage.data.splice(398, 1);
        localSourceArrayQuery.dataStorage.data.splice(443, 2);

   //     let delete_result = await Customer.delete(45);
        
        let beforeSource = await CustomerSource.select().where(CustomerSource.id.in([1, 2])).exec();
        let beforeDest = await Customer.select().where(Customer.id.in([45])).exec();

        let out = await CompareHelper.compareSorted(
            localSourceArrayQuery, localDBDestQuery, parameters, undefined, buffer);


        // let out = await CompareHelper.alignSorted(
        //     localSourceArrayQuery, localDBDestQuery, parameters, buffer );
        let after = await Customer.select().where(Customer.id.in([1, 2])).exec();

        expect(fail).to.equal(0);
        expect(out.buffer.totalUpdate).to.equal(4);
        expect(out.buffer.totalInsert).to.equal(0);
        expect(out.buffer.totalDelete).to.equal(9);
        
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