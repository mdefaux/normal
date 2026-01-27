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
 * * * @requires ../../src/orm/EntityBE.js
 * * * @requires ../../test/_test-setup
 * 
 * 
 */
const assert = require('assert');
const {EntityBE} = require('../../src/orm/EntityBE.js'); // Assuming EntityBE is the class to be tested
const fields = require( "../../src/orm/Field.js" );
const { exec } = require('child_process');
// const { expect } = require('chai');

describe("EntityBE test", function () {
    let entityBE;
    const entityName = 'TestEntity';
    const factory = {
        create: (name, data) => {
            return { id: Date.now(), name, ...data }; // Mocking a simple entity creation
        },
        // update: (id, data) => {
        //     return { id, ...data }; // Mocking a simple entity update
        // }
    };
    const host = {
        createQuery: (entityBE) => {
            return {
                select: (fields) => {
                    return { entity: entityBE.metaData.name, fields };
                }
            };
        },
        createUpdate(entityBE, id, data) {
            return { entity: entityBE.metaData.name, id, 
                ...data,
                value() { return this; },
                async exec() { return this; }
            };
        }
    }; // Mocking a host object

    beforeEach(function () {
        // Reset the entityBE before each test
        entityBE = new EntityBE(entityName, {
            // Mocking the entity metadata
            canCreate: () => true,
            canUpdate: () => true,
            canDelete: () => true,
        }, factory, host );
        entityBE.metaData.model = {
            fields: {
                id: new fields.NumberField( "id" ), //{ type: 'number', primaryKey: true },
                name: new fields.StringField( "name" )
            },
            canCreate: () => true,
            canUpdate: () => true,
            canDelete: () => true,
        };
        entityBE.setup();
    });

    it("should have the name", function () {
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

    it("should setup an entity", function () {

        
        assert( typeof entityBE.metaData === 'object' );
        
        assert( entityBE.hasOwnProperty('id') );
        assert( entityBE.hasOwnProperty('name') );
        assert.strictEqual( entityBE.id.field.type, 'number' );
        assert.strictEqual( entityBE.name.field.type, 'string' );
    });

    it("should create a relation", function () {
        // Mocking a relation creation
        entityBE.createRelation('relatedEntity', ()=>({
            type: 'one-to-many',
            modelClass: 'RelatedEntity'
        }));
        assert(typeof entityBE.metaData.relations === 'object');
        assert(entityBE.metaData.relations['relatedEntity']);
        // assert.strictEqual(entityBE.metaData.relations.relatedEntity().modelClass, 'RelatedEntity');
        const relation = entityBE.getRelation('relatedEntity');
        assert(typeof relation === 'object');
        assert(relation._metaData);
        assert.strictEqual(relation._metaData.refEntity.metaData.name, 'TestEntity');
    });

    it("should throw exception if creating relation with existing name", function () {
        // Mocking a relation creation
        entityBE.createRelation('relatedEntity', ()=>({
            type: 'one-to-many',
            modelClass: 'RelatedEntity'
        }));
        assert.throws(() => {
            entityBE.createRelation('relatedEntity', ()=>({
                type: 'one-to-many',
                modelClass: 'AnotherEntity'
            }));
        }, /Relation 'relatedEntity' already defined in entity 'TestEntity'./);
    });

    it("should throw exception if getting non-existing relation", function () {
        assert.throws(() => {
            entityBE.getRelation('nonExistingRelation');
        }, /'nonExistingRelation' is not related with entity 'TestEntity'./);
    });

    it("should select entities", function () {
        const query = entityBE.select('name');
        assert(typeof query === 'object');
        assert.strictEqual(query instanceof Object, true);
    });

    it("should update an entity", function () {
        const updateData = { name: 'Updated Name' };
        const updateResult = entityBE.update(1, updateData);
        assert(typeof updateResult === 'object');
        // cheks if is a promise
        assert.strictEqual(typeof updateResult.then, 'function');
        // return updateResult.then(result => {
        //     assert.strictEqual(result.entity, 'TestEntity');
        //     assert.strictEqual(result.id, 1);
        //     assert.strictEqual(result.name, 'Updated Name');
        // });
    });
});
