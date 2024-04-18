

class IAlignBuffer {

    constructor() {

    }

    async update( entity, record ) {
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


module.exports = IAlignBuffer;
