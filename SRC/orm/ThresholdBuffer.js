const {IAlignBuffer} = require("./IAlignBuffer");


class ThresholdBuffer extends IAlignBuffer {

    constructor() {
        super();
        this.updateThreshold = 100;
        this.updateCounter = 0;
        this.updateRecords = [];

        this.insertThreshold = 100;
        this.insertCounter = 0;
        this.insertRecords = [];

        this.deleteThreshold = 100;
        this.deleteCounter = 0;
        this.deleteRecords = [];

    }


    setThresholds(thresholds) {
        if (thresholds.insertThreshold) {
            this.insertThreshold = thresholds.insertThreshold;
        }
        if (thresholds.updateThreshold) {
            this.updateThreshold = thresholds.updateThreshold;
        }
        if (thresholds.deleteThreshold) {
            this.updateThreshold = thresholds.deleteThreshold;
        }

        return;
    }


    async update(entity, record, keys) {
        // update counter
        this.updateCounter++;

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
        let insertPromise = this.doInsert(entity, this.insertRecords);
        let updatePromise = this.doUpdate(entity, this.updateRecords);
        let deletePromise = this.doDelete(entity, this.deleteRecords);

        await Promise.all([
            insertPromise,
            updatePromise,
            deletePromise
        ]);

             
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
        //return updateResults;
        return;
    }

    async doInsert(entity, arrayOfRecord) {
        if(arrayOfRecord.length <=0) return;
        let result = await entity.insert(arrayOfRecord);
        // this.emptyRecordArray(this.insertRecords);
        this.insertRecords = [];
        return result;

    }

    async doDelete(entity, arrayOfRecord) {
        if(arrayOfRecord.length <=0) return;
        let result = await entity.delete(arrayOfRecord);
      //  this.emptyRecordArray(this.deleteRecords);
        this.deleteRecords = [];
        return result;

    }
}


module.exports = ThresholdBuffer;
