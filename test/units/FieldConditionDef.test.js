/**Unit test for FieldConditionDef 
 * This file contains unit tests for the FieldConditionDef class, which is responsible for defining conditions on fields in a query.
 * @usage
 * To run this test, use the command:
 * *      mocha test/units/FieldConditionDef.test.js
 * * For coverage, use:
 * *      npx nyc --reporter=text mocha test/units/FieldConditionDef.test.js
*/
const assert = require('assert');
const { FieldConditionDef, FieldQueryItem } = require('../../src/orm/FieldConditionDef.js'); // Assuming FieldConditionDef is the class to be tested

describe("FieldConditionDef test", function () {
    let fieldConditionDef;
    const type = 'string';
    const fieldName = 'testField';
    const tableAlias = '=';
    const value = 'testValue';
    const sourceField = {
        name: 'sourceField',
        sourceField: 'sourceField',
        sqlSource: 'sourceFieldSQL',
    };
    let fieldQueryItem = new FieldQueryItem(sourceField);
    it('should create a FieldConditionDef instance', function () {
        fieldConditionDef = new FieldConditionDef(type, fieldName, value);
        assert.strictEqual(fieldConditionDef.type, type);
        assert.strictEqual(fieldConditionDef.field, fieldName);
        assert.strictEqual(fieldConditionDef.value, value);
    });

    it('should create a field query item', function () {
        assert.strictEqual(fieldQueryItem.field, sourceField);
        assert.strictEqual(fieldQueryItem.name, sourceField.name);
        assert.strictEqual(fieldQueryItem.sourceField, sourceField.sourceField);
    });

    it.skip('should handle different operators', function () {
        const operators = ['=', '!=', '<', '>', '<=', '>='];
        operators.forEach(op => {
            const fc = new FieldConditionDef(type, fieldName, value, op);
            assert.strictEqual(fc.operator, op);
            assert.strictEqual(fc.toString(), `${fieldName} ${op} ${value}`);
        });
    });

    it('should call sqlSource getter', function () {
        const src = fieldQueryItem.sqlSource;
        // Since sqlSource is not implemented, we are just checking if it can be called without errors
        assert.strictEqual(src, sourceField.sourceField);
    });

    it('should call processValue method', function () {
        const obj = { 
            sourceField: "value of source field",
        };
        const value = fieldQueryItem.processValue( obj );
        // Since processValue is not implemented, we are just checking if it can be called without errors
        assert.strictEqual(value, obj.sourceField);
    });

    it('should call "in" method to obtain a new FieldConditionDef with IN operator', function () {
        const inCondition = fieldQueryItem.in(['value1', 'value2']);
        assert.strictEqual(inCondition instanceof FieldConditionDef, true);
        assert.strictEqual(inCondition.type, 'in');
        assert.deepStrictEqual(inCondition.value, ['value1', 'value2']);
    });

    it('should call "notIn" method to obtain a new FieldConditionDef with NOT IN operator', function () {
        const notInCondition = fieldQueryItem.notIn(['value1', 'value2']);
        assert.strictEqual(notInCondition instanceof FieldConditionDef, true);
        assert.strictEqual(notInCondition.type, 'not in');
        assert.deepStrictEqual(notInCondition.value, ['value1', 'value2']);
    });
    it('should call "equals" method to obtain a new FieldConditionDef with EQUALS operator', function () {
        const equalsCondition = fieldQueryItem.equals('value1');
        assert.strictEqual(equalsCondition instanceof FieldConditionDef, true);
        assert.strictEqual(equalsCondition.type, '=');
        assert.deepStrictEqual(equalsCondition.value, 'value1');
    });
    it('should call "notEquals" method to obtain a new FieldConditionDef with NOT EQUALS operator', function () {
        const notEqualsCondition = fieldQueryItem.notEquals('value1');
        assert.strictEqual(notEqualsCondition instanceof FieldConditionDef, true);
        assert.strictEqual(notEqualsCondition.type, '<>');
        assert.deepStrictEqual(notEqualsCondition.value, 'value1');
    });
    it('should call "greaterThan" method to obtain a new FieldConditionDef with GREATER THAN operator', function () {
        const greaterThanCondition = fieldQueryItem.greaterThan('value1');
        assert.strictEqual(greaterThanCondition instanceof FieldConditionDef, true);
        assert.strictEqual(greaterThanCondition.type, '>');
        assert.deepStrictEqual(greaterThanCondition.value, 'value1');
    });
    it('should call "lessThan" method to obtain a new FieldConditionDef with LESS THAN operator', function () {
        const lessThanCondition = fieldQueryItem.lessThan('value1');
        assert.strictEqual(lessThanCondition instanceof FieldConditionDef, true);
        assert.strictEqual(lessThanCondition.type, '<');
        assert.deepStrictEqual(lessThanCondition.value, 'value1');
    });
    it('should call "greaterThanOrEqual" method to obtain a new FieldConditionDef with GREATER THAN OR EQUAL operator', function () {
        const greaterThanOrEqualCondition = fieldQueryItem.greaterThanOrEqual('value1');
        assert.strictEqual(greaterThanOrEqualCondition instanceof FieldConditionDef, true);
        assert.strictEqual(greaterThanOrEqualCondition.type, '>=');
        assert.deepStrictEqual(greaterThanOrEqualCondition.value, 'value1');
    });
    it('should call "lessThanOrEqual" method to obtain a new FieldConditionDef with LESS THAN OR EQUAL operator', function () {
        const lessThanOrEqualCondition = fieldQueryItem.lessThanOrEqual('value1');
        assert.strictEqual(lessThanOrEqualCondition instanceof FieldConditionDef, true);
        assert.strictEqual(lessThanOrEqualCondition.type, '<=');
        assert.deepStrictEqual(lessThanOrEqualCondition.value, 'value1');
    });
    it('should call "like" method to obtain a new FieldConditionDef with LIKE operator', function () {
        const likeCondition = fieldQueryItem.like('value1');
        assert.strictEqual(likeCondition instanceof FieldConditionDef, true);
        assert.strictEqual(likeCondition.type, 'like');
        assert.deepStrictEqual(likeCondition.value, 'value1');
    });
    it.skip('should call "notLike" method to obtain a new FieldConditionDef with NOT LIKE operator', function () {
        const notLikeCondition = fieldQueryItem.notLike('value1');
        assert.strictEqual(notLikeCondition instanceof FieldConditionDef, true);
        assert.strictEqual(notLikeCondition.type, 'not like');
        assert.deepStrictEqual(notLikeCondition.value, 'value1');
    });
    it('should call "isNull" method to obtain a new FieldConditionDef with IS NULL operator', function () {
        const isNullCondition = fieldQueryItem.isNull();
        assert.strictEqual(isNullCondition instanceof FieldConditionDef, true);
        assert.strictEqual(isNullCondition.type, 'is null');
        assert.deepStrictEqual(isNullCondition.value, undefined);
    });
    it('should call "isNotNull" method to obtain a new FieldConditionDef with IS NOT NULL operator', function () {
        const isNotNullCondition = fieldQueryItem.isNotNull();
        assert.strictEqual(isNotNullCondition instanceof FieldConditionDef, true);
        assert.strictEqual(isNotNullCondition.type, 'is not null');
        assert.deepStrictEqual(isNotNullCondition.value, undefined);
    });
    it('should call "max" method to obtain a new FieldConditionDef with MAX operator', function () {
        
        const { FieldAggregationMax } = require("../../src/orm/FieldAggregation");
        const maxCondition = fieldQueryItem.max();
        assert.strictEqual(maxCondition instanceof FieldAggregationMax, true);
        assert.strictEqual(maxCondition.type, undefined);
        assert.deepStrictEqual(maxCondition.value, undefined);
    });

    /* checking the same methods on FieldConditionDef instance */
    it('should call "in" method to obtain a new FieldConditionDef with IN operator', function () {
        const inCondition = fieldConditionDef.in(['value1', 'value2']);
        assert.strictEqual(inCondition instanceof FieldConditionDef, true);
        assert.strictEqual(inCondition.type, 'in');
        assert.deepStrictEqual(inCondition.value, ['value1', 'value2']);
    });

    it('should call "notIn" method to obtain a new FieldConditionDef with NOT IN operator', function () {
        const notInCondition = fieldConditionDef.notIn(['value1', 'value2']);
        assert.strictEqual(notInCondition instanceof FieldConditionDef, true);
        assert.strictEqual(notInCondition.type, 'not in');
        assert.deepStrictEqual(notInCondition.value, ['value1', 'value2']);
    });
    it('should call "equals" method to obtain a new FieldConditionDef with EQUALS operator', function () {
        const equalsCondition = fieldConditionDef.equals('value1');
        assert.strictEqual(equalsCondition instanceof FieldConditionDef, true);
        assert.strictEqual(equalsCondition.type, '=');
        assert.deepStrictEqual(equalsCondition.value, 'value1');
    });
    it.skip('should call "notEquals" method to obtain a new FieldConditionDef with NOT EQUALS operator', function () {
        const notEqualsCondition = fieldConditionDef.notEquals('value1');
        assert.strictEqual(notEqualsCondition instanceof FieldConditionDef, true);
        assert.strictEqual(notEqualsCondition.type, '<>');
        assert.deepStrictEqual(notEqualsCondition.value, 'value1');
    });
    it('should call "greaterThan" method to obtain a new FieldConditionDef with GREATER THAN operator', function () {
        const greaterThanCondition = fieldConditionDef.greaterThan('value1');
        assert.strictEqual(greaterThanCondition instanceof FieldConditionDef, true);
        assert.strictEqual(greaterThanCondition.type, '>');
        assert.deepStrictEqual(greaterThanCondition.value, 'value1');
    });
    it.skip('should call "lessThan" method to obtain a new FieldConditionDef with LESS THAN operator', function () {
        const lessThanCondition = fieldConditionDef.lessThan('value1');
        assert.strictEqual(lessThanCondition instanceof FieldConditionDef, true);
        assert.strictEqual(lessThanCondition.type, '<');
        assert.deepStrictEqual(lessThanCondition.value, 'value1');
    });
    it('should call "createChained" method to obtain a new FieldConditionDef with chained conditions', function () {
        const chainedCondition = fieldConditionDef.createChained();
        assert.strictEqual(chainedCondition instanceof FieldConditionDef, true);
        assert.strictEqual(chainedCondition.tableAlias, fieldConditionDef.tableAlias);
        assert.deepStrictEqual(chainedCondition.query, fieldConditionDef.query);
    });
    it('should call "apply" method', function () {
         fieldConditionDef.apply({ query: 'testQuery' });
        // Since apply is not implemented, we are just checking if it can be called without errors
        assert.strictEqual(fieldConditionDef.query, undefined);
    });
    it('should call "apply" method to apply the condition to a query', function () {
        const fieldConditionDef = new FieldConditionDef(type, undefined, value);
        fieldConditionDef.columnName = "columnX";
        const otherField ={name: 'val', value: 'testValueX'};
        fieldConditionDef.apply({ columnX: otherField });
        // Since apply is not implemented, we are just checking if it can be called without errors
        assert.strictEqual(fieldConditionDef.field, otherField);
    });
    it.skip('should call "sqlField" getter on field condition to obtain the SQL source of the condition', function () {
        const src = fieldConditionDef.sqlField();
        // Since sqlField is not implemented, we are just checking if it can be called without errors
        assert.strictEqual(src, sourceField.sqlSource);
    });

});
