const assert = require('assert');
const Query = require( './orm/Query' );

class DataStorage {

    constructor() {
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

    getData(  ) {
        return this.data;
    }

    getRecord( id ) {
        return this.data[ this.uniqueIndex[ id ] ];
    }

    createQuery( entity ) {
        let query = new Query( entity );
        query.dataStorage = this;
        return query;
    }

}

module.exports = DataStorage;
