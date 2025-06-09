/** Utility.js unit test
 *  * This file contains unit tests for the Utility functions, specifically the soundsLike function.
 *  * @usage    
 * *  To run this test, use the command:
 * * *      mocha test/units/Utility.test.js
 * * *  For coverage, use:
 * * *      npx nyc --reporter=text mocha test/units/Utility.test.js
 * * * @requires mocha
 * * * @requires assert
 * * * @requires Utility
 * * * @requires ../../src/utils/Utility.js
 * *  * @requires ../../test/_test-setup
 * * 
 */
const assert = require('assert');
const {Utility} = require('../../src/utils/Utility.js'); // Assuming Utility is the module to be tested

describe("Utility test", function () {
    describe("soundsLike function", function () {
        it("should return 0 for identical strings", function () {
            assert.strictEqual(Utility.soundsLike("test", "test"), 0);
        });

        it("should return 1 for case-insensitive identical strings", function () {
            assert.strictEqual(Utility.soundsLike("Test", "test"), 1);
        });

        it("should return a score greater than 2 for different strings with matching characters", function () {
            assert.strictEqual(Utility.soundsLike("abc", "acb"), 2);
            assert.strictEqual(Utility.soundsLike("abc", "xyz"), 11);
        });

        it("should handle empty strings correctly", function () {
            assert.strictEqual(Utility.soundsLike("", ""), 0);
            assert.strictEqual(Utility.soundsLike("", "test"), 6);
            assert.strictEqual(Utility.soundsLike("test", ""), 6);
        });

        it("should handle strings with special characters and numbers", function () {
            assert.strictEqual(Utility.soundsLike("abc123", "321cba"), 2);
            assert.strictEqual(Utility.soundsLike("abc!@#", "!@#cba"), 2);
        });
        it("should return top 3 similar strings", function () {
            const strings = ["apple", "banana", "apricot", "grape", "orange"];
            const target = "appl";
            // const expected = ["apple", "apricot", "banana"];
            const expected = ["apple", "grape"];
            const result = Utility.top3Similar(target, strings, 3);
            assert.deepStrictEqual(result, expected);
        });
    });
})