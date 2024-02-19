

const assert = require("assert");

exports.FakeQuery = class FakeQuery {
    
    constructor() {
        this.entity = undefined;
        this.recordSet = [];
    }
    
    page(c, sp) {
        assert(c === null || !isNaN(c));
        assert(!isNaN(sp));
    }

    async exec() {

        if (!this.whereValue) return this.recordSet;

        /*     let condition = this.whereValue[0];
 
              let result = this.recordSet.filter(
                 condition.f
             ); */

        let result = this.whereValue.reduce((acc, condition) => {

            return acc.filter(
                condition.f
            );

        }, this.recordSet);


        return result;

    }
    where(condition) {
        assert(condition);
        this.whereValue = [...this.whereValue || [], condition];
        return this;
    }
    andWhere(condition) {
        assert(condition);
        return this.where(condition);
    }
    clone() {
        let clone = new FakeQuery();
        clone.entity = this.entity;
        clone.recordSet = this.recordSet;
        clone.id = this.id;
        clone.whereValue = this.whereValue;

        return clone;
    }
    /*    insert(record) {
           return Promise.resolve(record);
       } */
};

  