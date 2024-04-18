


class ThresholdBuffer extends IAlignBuffer {

    constructor() {

    }

    async update( entity, record ) {
        // update counter
        // TODO: if counter reach threshold 
        this.doUpdate(entity);
    }

    async insert( entity, record ) {
        // update counter
        // TODO: if counter reach threshold 
        this.doInsert(entity);
    }

    async delete( entity, record ) {
        // update counter
        // TODO: if counter reach threshold 
        this.doDelete(entity);
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


module.exports = ThresholdBuffer;
