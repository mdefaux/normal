/**
 * 
 * TODO: extends InsertStatement which extends Statement or 
 * Statement directly
 */
class KdbInsert /*extends InsertStatement */ {

    constructor( entity, knex ) {
        // TODO: uncoment if extends Statement
        // super( entity );
        this.knex = knex;
        // TODO: move to Statement
        this.entity = entity;

        this.setup();
    }


    setup() {
        
    }

    // TODO: move then and abstract exec 
    // to Statement: a common super class of 
    // Query and InsertStatement.
    then(callback) {

        // TODO: move to exec
        return new Promise( (resolve, reject ) => (
            this.knex
                .insert( this.processedRecord )
                .into( this.entity.model.dbTableName )
                .returning( this.entity.model.idField )
                .then( rows => (rows[0]) )
                .then( (rec) => ( resolve( callback ? callback(rec) : rec ) ) )
        ))
    }

    // TODO: 'then' should call 'exec'
    exec(){
        return this.then();
    }


    value( record ) {
        // TODO: parse object and keep only column defined in model
        // should handle object link's field values passed 
        // as ObjectLink: { id: xxx, label: 'xxx' }
        // can use this.entity.parse( record )...
        this.processedRecord = record;
        return this;
    }

    // TODO: declare debug as abstract method of Statement, implemented here
    debug() {
        // TODO: weird use of qb, not used in insert
        // should sets a flag checked when inserting with knex.insert
        this.qb.debug();

        return this;
    }
}

exports.KdbInsert = KdbInsert;
