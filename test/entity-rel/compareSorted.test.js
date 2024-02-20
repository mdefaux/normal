/**Test for CompareHelper
 * 
 * @usage
 *  mocha test/entity-rel/compareHelper.test.js 
 *  
 * With coverage:
 *  npx nyc --reporter=text mocha test/entity-rel/compareHelper.test.js
 */
const { CompareHelper } = require("../../src/orm/CompareHelper");
const assert = require("assert");
const { FakeQuery } = require("./FakeQuery");



describe("CompareSorted test", function () {
    const parameters = {
        columnMap: (rec) => (rec)
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
            assert(c === null || !isNaN(c));
            assert(!isNaN(sp));
        },
        async exec() {
            return [];
        }
    };

    const destQuery = {
        entity: Customer,
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





    const localDestQuery = new FakeQuery();
    localDestQuery.entity = localCustomer;
    localDestQuery.recordSet = [
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
    localDestQuery.id = {
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

    it("compareSorted test", async function () {
        //const parameters = {};

        let out = await CompareHelper.compareSorted(
            localSourceQuery, localDestQuery, parameters);

        assert(out);
    });




});