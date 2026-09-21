const assert = require('assert');
const {Query} = require( './orm/Query' );
const {InsertStatement} = require('./orm/InsertStatement');
const {UpdateStatement} = require('./orm/UpdateStatement');
const {DeleteStatement} = require('./orm/DeleteStatement');
const { StoreHost } = require('./orm/StoreHost');

class DataInsert extends InsertStatement {

    constructor( entity, storage ) {
        super( entity );
        this.storage = storage;
    }

    async execute() {
        const records = Array.isArray(this.processedRecord)
            ? this.processedRecord
            : [this.processedRecord];
        const idField = this.entity.metaData.model.idField;
        let nextId = this.storage.data.reduce(
            (maximum, record) => Math.max(maximum, Number(record[idField]) || 0), 0
        ) + 1;

        records.forEach(record => {
            if (record[idField] === undefined) {
                record[idField] = nextId++;
            }
            this.storage.data.push(record);
        });

        return Array.isArray(this.processedRecord) ? 0 : records[0][idField];
    }
}

class DataUpdate extends UpdateStatement {

    constructor( entity, storage ) {
        super( entity );
        this.storage = storage;
    }

    value( id, record ) {
        this.recordId = id;
        return super.value(record);
    }

    async execute() {
        const idField = this.entity.metaData.model.idField;
        const ids = Array.isArray(this.recordId) ? this.recordId : [this.recordId];

        this.storage.data.forEach(record => {
            if (ids.includes(record[idField])) {
                Object.assign(record, this.processedRecord);
            }
        });

        return this.recordId;
    }
}

class DataDelete extends DeleteStatement {

    constructor( entity, storage ) {
        super( entity );
        this.storage = storage;
    }

    async execute() {
        const idField = this.entity.metaData.model.idField;
        const values = Array.isArray(this.processedRecord)
            ? this.processedRecord
            : [this.processedRecord];
        const ids = values.map(value => typeof value === 'object' ? value[idField] : value);

        this.storage.data = this.storage.data.filter(record => !ids.includes(record[idField]));
        return ids.length;
    }
}

class DataStorage extends StoreHost {

    constructor() {
        super();
        this.data = [];
        this.uniqueIndex = {};
    }

    setData( jsonData ) {
        assert( jsonData );
        assert( typeof jsonData.reduce === 'function' );

        this.data = jsonData;
    }

    addIndex( columnName ) {
        assert( this.data );
        assert( typeof this.data.reduce === 'function' );

        this.uniqueIndex[ columnName ] = this.data.reduce( 
            (prev,rec,index)=> ({...prev, [rec[columnName]]: index}), {} )
    }

    getData( range ) {
        if( !range || (!range.start && !range.size) ) {
            return this.data;
        }

        if( range.start >= this.data.length ) {
            return false;
        }
        
        let data = this.data.slice( 
            range.start, range.start + range.size
        );
        return data;
    }

    getRecord( id ) {
        return this.data[ this.uniqueIndex[ id ] ];
    }

    createQuery( entity ) {
        let query = new Query( entity );
        query.dataStorage = this;
        return query;
    }

    createInsert( entity ) {
        return new DataInsert(entity, this);
    }

    createUpdate( entity ) {
        return new DataUpdate(entity, this);
    }

    createDelete( entity ) {
        return new DataDelete(entity, this);
    }

}

module.exports = DataStorage;
