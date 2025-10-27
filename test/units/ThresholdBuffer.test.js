/**Unit test for ThresholdBuffer using a custom buffer class.
 * 
 * This test suite checks the functionality of the ThresholdBuffer class,
 * including setting thresholds, updating, inserting, and deleting records.
 * It uses assertions to verify that the thresholds are respected and that
 * the records are processed correctly.
 * 
 * @usage
 *  To run this test, use the command: 
 *      mocha test/entity-rel/ThresholdBuffer.test.js
 *  For coverage, use:
 *      npx nyc --reporter=text mocha test/entity-rel/ThresholdBuffer.test.js
 * 
 * @requires mocha
 * @requires assert     
 * @requires ThresholdBuffer
 * @requires ../../orm/ThresholdBuffer
 * @requires ../../test/_test-setup
 *  
 **/
const assert = require('assert');
const ThresholdBuffer = require('../../src/orm/ThresholdBuffer.js');
const EntityBE = require('../stubs/Entity.stub.js'); // Assuming EntityBE is a stub for the entity operations

describe("ThresholdBuffer test", function () {

    const entity = new EntityBE();
    beforeEach(function () {
        // Reset the buffer before each test    
        // entity.updateRecords = [];
        // entity.insertRecords = [];
        // entity.deleteRecords = [];
        // entity.totalUpdate = 0;
        // entity.totalInsert = 0;
        // entity.totalDelete = 0;
        // entity.updateThreshold = 100;
        // entity.insertThreshold = 100;
        // entity.deleteThreshold = 100;
    });
    it("should set and get thresholds correctly", function () {
        const buffer = new ThresholdBuffer();
        buffer.setThresholds({ insertThreshold: 50, updateThreshold: 75, deleteThreshold: 25 });

        assert.strictEqual(buffer.insertThreshold, 50);
        assert.strictEqual(buffer.updateThreshold, 75);
        assert.strictEqual(buffer.deleteThreshold, 25);
    });

    it("should update records and reach threshold", async function () {
        const buffer = new ThresholdBuffer();
        buffer.updateThreshold = 2; // Set a low threshold for testing
        await buffer.update(entity, { id: 1 }, 1);
        assert.strictEqual(buffer.updateRecords.length, 1);
        await buffer.update(entity, { id: 2 }, 2);

        assert.strictEqual(buffer.updateRecords.length, 0);
        assert.strictEqual(buffer.totalUpdate, 2);
    });

    it("should insert records and reach threshold", async function () {
        const buffer = new ThresholdBuffer();
        buffer.insertThreshold = 3; // Set a low threshold for testing
        await buffer.insert(entity, { id: 1 });
        await buffer.insert(entity, { id: 2 });
        assert.strictEqual(buffer.insertRecords.length, 2);
        await buffer.insert(entity, { id: 3 });

        assert.strictEqual(buffer.insertRecords.length, 0);
        assert.strictEqual(buffer.totalInsert, 3);
    });

    it("should delete records and reach threshold", async function () {
        const buffer = new ThresholdBuffer();
        buffer.deleteThreshold = 2; // Set a low threshold for testing
        await buffer.delete(entity, { id: 1 });
        await buffer.delete(entity, { id: 2 });

        assert.strictEqual(buffer.deleteRecords.length, 0);
        assert.strictEqual(buffer.totalDelete, 2);
    });
    it("should handle mixed operations correctly", async function () {
        const buffer = new ThresholdBuffer();
        buffer.updateThreshold = 2;
        buffer.insertThreshold = 2;
        buffer.deleteThreshold = 2;

        await buffer.update(entity, { id: 1 }, 1);
        await buffer.insert(entity, { id: 2 });
        await buffer.delete(entity, { id: 3 });

        assert.strictEqual(buffer.updateRecords.length, 1);
        assert.strictEqual(buffer.insertRecords.length, 1);
        assert.strictEqual(buffer.deleteRecords.length, 1);

        await buffer.update(entity, { id: 4 }, 4);
        await buffer.insert(entity, { id: 5 });
        await buffer.delete(entity, { id: 6 });

        assert.strictEqual(buffer.updateRecords.length, 0);
        assert.strictEqual(buffer.insertRecords.length, 0);
        assert.strictEqual(buffer.deleteRecords.length, 0);

        assert.strictEqual(buffer.totalUpdate, 2);
        assert.strictEqual(buffer.totalInsert, 2);
        assert.strictEqual(buffer.totalDelete, 2);
    });
    // it("should handle empty operations gracefully", async function () {
    //     const buffer = new ThresholdBuffer();
    //     buffer.updateThreshold = 2;
    //     buffer.insertThreshold = 2;
    //     buffer.deleteThreshold = 2;

    //     // No operations should not throw errors
    //     await buffer.update(entity, {}, null);
    //     await buffer.insert(entity, {});
    //     await buffer.delete(entity, {});

    //     assert.strictEqual(buffer.updateRecords.length, 0);
    //     assert.strictEqual(buffer.insertRecords.length, 0);
    //     assert.strictEqual(buffer.deleteRecords.length, 0);

    //     assert.strictEqual(buffer.totalUpdate, 1);
    //     assert.strictEqual(buffer.totalInsert, 1);
    //     assert.strictEqual(buffer.totalDelete, 1);
    // });
    it("should use flush method to process remaining records", async function () {
        const buffer = new ThresholdBuffer();
        buffer.updateThreshold = 2;
        buffer.insertThreshold = 2;
        buffer.deleteThreshold = 2;

        await buffer.update(entity, { id: 1 }, 1);
        await buffer.insert(entity, { id: 2 }); // Insert one record
        await buffer.delete(entity, { id: 3 }); // Delete one record            
        // Flush remaining records
        await buffer.flush(entity);
        assert.strictEqual(buffer.updateRecords.length, 0); 
        assert.strictEqual(buffer.insertRecords.length, 0);
        assert.strictEqual(buffer.deleteRecords.length, 0);
        assert.strictEqual(buffer.totalUpdate, 1);
        assert.strictEqual(buffer.totalInsert, 1);
        assert.strictEqual(buffer.totalDelete, 1);
    }
    );
});
