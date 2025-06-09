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
// const { IAlignBuffer } = require('../../../../src/orm/IAlignBuffer');
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


    it("use a Threshold buffer, update + insert only", async function () {
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
                fail = 1;
                assert(record.id === 6 || record.id === 7 || record.id === 31 || record.id === 32 || record.id === 33
               || record.id === 221 || record.id === 405 || record.id === 451 || record.id === 452);
                await super.delete(entity, record)
            }
            async insert(entity, record) {
              //  fail = 1;
          //     assert(record.name === "Skiptube"); 
               await super.insert(entity, record);
            }
            async flush(entity, last) {
                if(last) {
                    await super.flush(entity);
                    return;
                }
                else {
                    let updatePromise = await this.doUpdate(entity, this.updateRecords);
                    let deletePromise = await this.doDelete(entity, this.deleteRecords);
                    return;
                }
            }

        }
        let buffer = new MyBuffer();
        //let buffer = new ThresholdBuffer();

        // updates
        localSourceArrayQuery.dataStorage.data[0].name = 'change1'
        localSourceArrayQuery.dataStorage.data[1].address = 'change2'
        localSourceArrayQuery.dataStorage.data[51].address = 'change3'
        localSourceArrayQuery.dataStorage.data[52].address = 'change4'


        // deletes
        // localSourceArrayQuery.dataStorage.data.splice(30, 3);
        // localSourceArrayQuery.dataStorage.data.splice(5, 2);
        // localSourceArrayQuery.dataStorage.data.splice(215, 1);
        // localSourceArrayQuery.dataStorage.data.splice(398, 1);
        // localSourceArrayQuery.dataStorage.data.splice(443, 2);

        // inserts
         let delete_result1 = await Customer.delete(45);
         let delete_result2 = await Customer.delete(32);
         let delete_result3 = await Customer.delete(10);
         let delete_result4 = await Customer.delete(360);
         let delete_result5 = await Customer.delete(169);
         let delete_result6 = await Customer.delete(120);
        
        // let beforeSource = await CustomerSource.select().where(CustomerSource.id.in([1, 2])).exec();
        // let beforeDest = await Customer.select().where(Customer.id.in([45])).exec();

        
        buffer.setThresholds({insertThreshold: 50000});

        let out = await CompareHelper.compareSorted(
            localSourceArrayQuery, localDBDestQuery, parameters, undefined, buffer);


        // let out = await CompareHelper.alignSorted(
        //     localSourceArrayQuery, localDBDestQuery, parameters, buffer );
        let after = await Customer.select().where(Customer.id.in([1, 2])).exec();

        expect(fail).to.equal(0);
        expect(out.buffer.totalUpdate).to.equal(4);
        expect(out.buffer.totalInsert).to.equal(6);
        expect(out.buffer.totalDelete).to.equal(0);
        
        assert(out);

        await Log.insert({
            what: `Test 'use a Threshold buffer' has ended`,
            activity_type: `align-customer`
        });

        const logs = await Log.select().exec();

        // TODO: assert check instead of console.log
        console.log(logs);
    });


});