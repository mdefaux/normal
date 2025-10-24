/** RelationEntity unit tests
 * * This file contains unit tests for the RelationEntity class, which is responsible for managing relationships between entities.
 * * @usage
 *      To run this test, use the command:
 *          mocha test/units/RelationEntity.test.js
 * *    For coverage, use:
 *          npx nyc --reporter=text mocha test/units/RelationEntity.test.js
 * * @requires mocha
 *   @requires assert
 *   @requires RelationEntity
 *                    
 * * @requires ../../orm/RelationEntity
 * * @requires EntityBE
 * * @requires ../stubs/Entity.stub.js
 *
 * 
 */
const assert = require('assert');
const { RelationEntity } = require('../../src/orm/RelationEntity.js');      
const { EntityBE } = require('../../src/orm/EntityBE.js');

describe("RelationEntity test", function () {
    let entityBE;

    beforeEach(function () {
        // Reset the relationEntity before each test
        entityBE = new EntityBE('TestEntity', {
            // Mocking the entity metadata
            canCreate: () => true,
        }, {} );
    });

    it("should create a relation", function () {

        entityBE.createRelation('relatedEntities', (entity1, entity2) => {
            return { entity1, entity2 };
        });
        let relation = entityBE.getRelation('relatedEntities', {});

        assert.strictEqual(typeof relation, 'object');
        assert( relation instanceof RelationEntity );
        
        // assert.strictEqual(relation.entity1, entity1);
        // assert.strictEqual(relation.entity2, entity2);
    });

    // it("should get relations for an entity", function () {
    //     const entity = { id: 1, name: 'Entity1' };
    //     const relations = relationEntity.getRelations(entity);
    //     assert(Array.isArray(relations));
    // });

    // it("should remove a relation", function () {
    //     const entity1 = { id: 1, name: 'Entity1' };
    //     const entity2 = { id: 2, name: 'Entity2' };
    //     relationEntity.createRelation(entity1, entity2);
    //     const result = relationEntity.removeRelation(entity1, entity2);
    //     assert.strictEqual(result, true);
    // });
});
