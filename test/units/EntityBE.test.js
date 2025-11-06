/**EntityBE.test.js
 * Unit test file for EntityBE class
 * * This file contains unit tests for the EntityBE class, which is responsible for managing entity operations such as creating, updating, and deleting entities.
 *  * @usage
 * *  To run this test, use the command:
 * * *      mocha test/units/EntityBE.test.js
 * * *  For coverage, use:
 * * *      npx nyc --reporter=text mocha test/units/EntityBE.test.js
 * * * @requires mocha
 *  * * @requires assert
 * * * @requires EntityBE
 * * * @requires ../../orm/EntityBE
 * * * @requires ../../test/_test-setup
 * 
 * 
 */
const assert = require('assert');
const {EntityBE} = require('../../src/orm/EntityBE.js'); // Assuming EntityBE is the class to be tested

describe("EntityBE test", function () {
    let entityBE;
    const entityName = 'TestEntity';
    const factory = {
        create: (name, data) => {
            return { id: Date.now(), name, ...data }; // Mocking a simple entity creation
        },
        update: (id, data) => {
            return { id, ...data }; // Mocking a simple entity update
        }
    };

    beforeEach(function () {
        // Reset the entityBE before each test
        entityBE = new EntityBE(entityName, {
            // Mocking the entity metadata
            canCreate: () => true,
            canUpdate: () => true,
            canDelete: () => true,
        }, factory );
    });

    it("should have the name", function () {
        assert.strictEqual(entityBE.name, undefined);
        assert.strictEqual(entityBE.metaData.name, entityName);
    });

    it("should have the correct model", function () {
        assert.strictEqual(entityBE.metaData.model.canCreate(), true);
        assert.strictEqual(entityBE.metaData.model.canUpdate(), true);
        assert.strictEqual(entityBE.metaData.model.canDelete(), true);
        // assert.strictEqual(entityBE.canCreate, true);
        // assert.strictEqual(entityBE.canUpdate, true);   
        // assert.strictEqual(entityBE.canDelete, true);

    });

    it.skip("should setup an entity", function () {

        entityBE.metaData.model = {
            fields: {
                id: { type: 'number', primaryKey: true },
                name: { type: 'string' }
            }
        };
        entityBE.setup();
        assert( typeof entityBE.metaData === 'object' );
        
        assert( entityBE.hasOwnProperty('id') );
        assert( entityBE.hasOwnProperty('name') );
        assert.strictEqual( entityBE.id.type, 'number' );
        assert.strictEqual( entityBE.name.type, 'string' );
    });
});