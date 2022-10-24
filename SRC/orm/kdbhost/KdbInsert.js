const { InsertStatement } = require("../InsertStatement");

/**
 * 
 * @extends InsertStatement which extends Statement
 */
class KdbInsert extends InsertStatement {

    constructor( entity, knex ) {
        // extends Statement
        super( entity );
        this.knex = knex;

        // this.setup();
    }


    setup() {
        
    }

    // executes the statment
    async exec( ) {

        return this.knex
            .insert( this.processedRecord )
            .into( this.entity.model.dbTableName )
            .returning( this.entity.model.idField )
            .debug( this.debugOn )
            .then( rows => (rows[0]) )
    }

    value( record ) {
        // TODO: parse object and keep only column defined in model
        // should handle object link's field values passed 
        // as ObjectLink: { id: xxx, label: 'xxx' }
        // can use this.entity.parse( record )...
        this.processedRecord = record;
        return this;
    }

}

exports.KdbInsert = KdbInsert;
