

const assert = require("assert");

exports.FakeQuery = class FakeQuery {
    
    constructor() {
        this.entity = undefined;
        this.recordSet = [];
    }
    
    page(pageIndex, pageSize, offset) {
        // assert(c === null || !isNaN(c));
        // assert(!isNaN(sp));

     //   this.pageIndex = pageIndex;
        this.size = pageSize || this.size;
        this.offset = offset !== undefined ? offset : ((pageIndex|| 1)-1)*this.size;

        assert(this.offset !== undefined);
        return this;
    }
  
    /**Sets a range for the data 
     * 
     * @param {int} limit number of records to extract
     * @param {int} offset starting record to return, 0 is the first record
     * @returns 
     * @example range(100, 300)  extract from record 300 to 399
     */
     setRange( limit, offset=0 ) {
      this.limit = limit || this.limit ||  50;
      this.offset = parseInt(offset);
    
      return this;
    }

    async exec() {

 /*        if (!this.whereValue) {
            return this.recordSet
        }; */

        /*     let condition = this.whereValue[0];
 
              let result = this.recordSet.filter(
                 condition.f
             ); */

        let whereConditions = this.whereValue || [];

        let result = whereConditions.reduce((acc, condition) => {

            return acc.filter(
                condition.f
            );

        }, this.recordSet);

        // paging
        if(this.offset !== undefined) {
            result = result.slice(this.offset,  this.offset + this.size );
        }


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
    pageSize(size){
        this.size=size;
        return this;
    }
    orderBy(){
        return this;
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

  