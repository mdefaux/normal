const { UpdateStatement } = require("../UpdateStatement");

/**Knex Update
 * 
 */
class KdbUpdate extends UpdateStatement {

    constructor( entity, knex ) {
        super( entity );
        this.knex = knex;
        // this.entity = entity;

        // this.setup();
    }


    setup() {
        
    }

    async execute( ) {
    
        let rowId = typeof this.recordId === 'object' ? this.recordId : {
            id: this.recordId
        };

        // if the table has multiple rows used as id, the function expects an Object with all the columns and values as input.
        // it will be used directly in the knex.update function

        if(typeof this.recordId === 'object' && !Array.isArray(this.recordId) && this.recordId !== null ) {
            rowId = this.recordId;
        }

        return await this.knex( this.entity.model.dbTableName )
            .where(rowId)
            .update(this.processedRecord /* , returning */)
            .debug( this.debugOn )
            .then( 
                rows => (rows[0]) )
    }

    value(id, record ) {
        this.recordId = id;
        // this.processedRecord = this.toRaw( record );
        super.value( record );
        return this;
    }

    debug() {
        this.qb.debug();

        return this;
    }
}

exports.KdbUpdate = KdbUpdate;
