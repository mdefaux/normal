
class RecordsArray extends Array {
    constructor(...args) {
        super(...args);
    }

    // Custom methods for RecordsArray can be added here

    // convert to plain array
    toPlainArray() {
        return Array.from(this);
    }

    // converts plain array to RecordsArray
    static fromPlainArray(plainArray) {
        const recordsArray = new RecordsArray();
        plainArray.forEach(item => recordsArray.push(item));
        return recordsArray;
    }

    // gets unique value ofa field
    getUniqueFieldValues(fieldName) {
        const valuesSet = new Set();
        this.forEach(record => {
            if (record[fieldName] !== undefined) {
                valuesSet.add(record[fieldName]);
            }
        });
        return Array.from(valuesSet);
    }

    /**filter by field value
     * 
     */
    filterByFieldValue(fieldName, value) {
        return this.filter(record => record[fieldName] === value);
    }

   /**
    * Filters the records by a specific field and value.
    * @param {string} fieldName - The name of the field to filter by.
    * @param {*} value - The value to filter for.
    * @returns {RecordsArray} - A new RecordsArray containing the filtered records.
    */
    filterByFieldValue(fieldName, value) {
        const filteredRecords = this.filter(record => record[fieldName] === value);
        return RecordsArray.fromPlainArray(filteredRecords);
    }

    /** Adds a new column to all records
     * @param {string} columnName - The name of the new column to add.
     * @param {*} defaultValue - The default value to set for the new column.
     *      defaultValue can be a static value or a function that returns a value.
     *      the callback function takes the record as parameter.
     * @returns {RecordsArray} - The updated RecordsArray with the new column added.
     */
    addColumn(columnName, defaultValue = null) {
        this.forEach(record => {
            // if default value is a function, call it to get the value
            if (typeof defaultValue === 'function') {
                record[columnName] = defaultValue(record);
                return;
            }
            record[columnName] = defaultValue;
        });
        return this;
    }
}
module.exports = RecordsArray;