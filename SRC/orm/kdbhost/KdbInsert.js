
class KdbInsert /*extends InsertStatement */ {

    constructor( entity, knex ) {
        // super( entity );
        this.knex = knex;
        this.entity = entity;

        this.setup();
    }


    setup() {
        
    }

    then(callback) {

        return new Promise( (resolve, reject ) => (
            this.knex
                .insert( this.processedRecord )
                .into( this.entity.model.dbTableName )
                .returning( this.entity.model.idField )
                .then( rows => (rows[0]) )
                .then( (rec) => ( resolve( callback ? callback(rec) : rec ) ) )
        ))
    }

    exec(){
        return this.then();
    }

    value( record )
    {
        this.processedRecord = record;
        return this;
    }

    debug() {
        this.qb.debug();

        return this;
    }
}

exports.KdbInsert = KdbInsert;
