

class IAlignBuffer {

    constructor() {
        this.offset = 0;
        this.lastUniqueKey = null;
    }

    getOffset() {
        return this.offset || 0;
    }

    getLastUniqueKey() {
        return this.lastUniqueKey;
    }

    setLastUniqueKey(value) {
        this.lastUniqueKey = value;
        return ;
    }


    async update( entity, record, keys ) {
        this.doUpdate();
    }

    async insert( entity, record ) {
        this.doInsert();
    }

    async delete( entity, record ) {
        this.doDelete();
    }

    async flush( entity ) {
    }

    /**Methods to implement
     * 
     */
    async doUpdate( entity, arrayOfRecord ) {}

    async doInsert( entity, arrayOfRecord ) {}

    async doDelete( entity, arrayOfRecord ) {}
}


// module.exports = IAlignBuffer;
exports.IAlignBuffer = IAlignBuffer;
