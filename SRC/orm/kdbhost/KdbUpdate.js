class KdbUpdate /*extends InsertStatement */ {

    constructor( entity, knex ) {
        // super( entity );
        this.knex = knex;
        this.entity = entity;

        this.setup();
    }


    setup() {
        
    }

    then(callback/* , returning */) {
    
        let rowId = typeof this.recordId === 'object' ? this.recordId : {
            id: this.recordId
        };

        // if the table has multiple rows used as id, the function expects an Object with all the columns and values as input.
        // it will be used directly in the knex.update function

        if(typeof this.recordId === 'object' && !Array.isArray(this.recordId) && this.recordId !== null ) {
            rowId = this.recordId;
        }

        return new Promise( (resolve, reject ) => (
            this.knex( this.entity.model.dbTableName)
                .where(rowId)
                .update(this.processedRecord /* , returning */)
                .then( 
                    rows => (rows[0]) )
                .then( (rec) => (
                     resolve( callback ? callback(rec) : rec ) ) )
        ))
    }

    exec(/* returning */){
     //   if(!returning ||  returning.length === 0) returning = this.getDefaultSelectFields();
        return this.then(null /*, returning */);
    }

    value(id, record )
    {
        this.recordId = id;
        this.processedRecord = record;
        return this;
    }

    debug() {
        this.qb.debug();

        return this;
    }
}

exports.KdbUpdate = KdbUpdate;
