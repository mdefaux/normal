const {Query} = require("./Query");


class DataQuery extends Query {


    constructor( data, entity ) {
        super( entity );
        this.data;
        this.storage = { 
            getData: () => data
        }
    }


}

exports.DataQuery = DataQuery;
