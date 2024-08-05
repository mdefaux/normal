const {IAlignBuffer} = require("./IAlignBuffer");


class ThresholdBuffer extends IAlignBuffer {

    constructor() {
        super();
        this.updateThreshold = 100;
        this.updateCounter = 0;
        this.updateRecords = [];
        this.totalUpdate = 0;

        this.insertThreshold = 100;
        this.insertCounter = 0;
        this.insertRecords = [];
        this.totalInsert = 0;

        this.deleteThreshold = 100;
        this.deleteCounter = 0;
        this.deleteRecords = [];
        this.totalDelete = 0;

    }


    setThresholds(thresholds) {
        if (thresholds.insertThreshold !== undefined) {
            this.insertThreshold = thresholds.insertThreshold;
        }
        if (thresholds.updateThreshold !== undefined) {
            this.updateThreshold = thresholds.updateThreshold;
        }
        if (thresholds.deleteThreshold !== undefined) {
            this.deleteThreshold = thresholds.deleteThreshold;
        }

        return;
    }


    async update(entity, record, keys) {
        // update counter
        this.updateCounter++;
        this.totalUpdate++;

        let ref = {
            keys: keys,
            record: record
        }

        // add record to updateRecords array
        this.updateRecords.push(ref);

        // TODO: if counter reach threshold 
        if (this.updateRecords.length >= this.updateThreshold) {
            await this.doUpdate(entity, this.updateRecords);
           // this.updateCounter = 0;

        }

        // else ???
        return Promise.resolve(true);

    }

    async insert(entity, record) {
        // update counter
        this.insertCounter++;
        this.totalInsert++;

        // add record to insertRecords array
        this.insertRecords.push(record);

        // TODO: if counter reach threshold 
        if (this.insertRecords.length >= this.insertThreshold) {
            await this.doInsert(entity, this.insertRecords);
           // this.insertCounter = 0;
        }

        // else ???
        return Promise.resolve(true);
    }

    async delete(entity, record) {
        // update counter
        this.deleteCounter++;
        this.totalDelete++;
        this.deleteRecords.push(record);

        // TODO: if counter reach threshold
        if (this.deleteRecords.length >= this.deleteThreshold) {
            await this.doDelete(entity, this.deleteRecords);
         //   this.deleteCounter = 0;
        }

        // else ???
        return Promise.resolve(true);
    }

    async flush(entity) {
        let insertPromise = await this.doInsert(entity, this.insertRecords);
        let updatePromise = await this.doUpdate(entity, this.updateRecords);
        let deletePromise = await this.doDelete(entity, this.deleteRecords);

        /* await Promise.all([
            insertPromise,
            updatePromise,
            deletePromise
        ]); */

        return;
             
    }

    /**Methods to implement
     * 
     */
    async doUpdate(entity, arrayOfRecord) {
        
        // entity.update accepts one record at a time.
        // cycle arrayOfRecord and call update 
/*         let updateResults = arrayOfRecord.map(record => {
            return entity.update(record.keys, record.record);
        });

        await Promise.all(updateResults);
 */

        for (const rec of arrayOfRecord) {
            await entity.update(rec.keys, rec.record);
        }

        //this.emptyRecordArray(this.updateRecords);
        this.updateRecords = [];
        this.updateCounter = 0;
        //return updateResults;
        return;
    }

    async doInsert(entity, arrayOfRecord) {
        if(arrayOfRecord.length <=0) return;
        let result = await entity.insert(arrayOfRecord);
        // this.emptyRecordArray(this.insertRecords);
        this.insertRecords = [];
        this.insertCounter = 0;
        this.offset = this.offset + arrayOfRecord.length;
        return result;

    }

    async doDelete(entity, arrayOfRecord) {
        if(arrayOfRecord.length <=0) return;
        let result = await entity.delete(arrayOfRecord);
      //  this.emptyRecordArray(this.deleteRecords);
        this.deleteRecords = [];
        this.deleteCounter = 0;
        this.offset = this.offset - arrayOfRecord.length;
        return result;

    }
}


module.exports = ThresholdBuffer;
