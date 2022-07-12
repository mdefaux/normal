const Query = require( './orm/Query' );

class DataStorage {

    constructor() {
        this.data = [];
        this.uniqueIndex = {};
    }

    setData( jsonData ) {
        this.data = jsonData;
    }

    addIndex( columnName ) {
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

    }

}

module.exports = DataStorage;
