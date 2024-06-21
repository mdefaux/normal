const {IAlignBuffer} = require("../../../../src/orm/IAlignBuffer");


class DbBuffer extends IAlignBuffer {

    constructor() {

    }

    // async update( entity, record ) {

    // }

    // async insert( entity, record ) {

    // }

    // async delete( entity, record ) {

    // }

    // async flush( entity ) {

    // }

    /**Methods to implement
     * 
     */
    async doUpdate( entity, record) {
        await entity.update( record );
    }

    async doInsert( entity, record ) {}

    async doDelete( entity, record ) {}
}


module.exports = DbBuffer;
