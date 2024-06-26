/**
 * 
 */
const { DeleteStatement } = require("../DeleteStatement");

/**
 * 
 * @extends DeleteStatement which extends Statement.
 */
 class KdbDelete extends DeleteStatement {

    constructor( entity, knex ) {
        // passes it to Statement superclass
        super( entity );
        // keeps knex reference to create the knex statement
        this.knex = knex;

        // this.setup();
    }


    setup() {
        
    }

    /**Creates the knex statment and configure it
     *  
     */ 
    async execute() {
      let ids = this.processedRecord;

      if (Array.isArray(this.processedRecord)) {
        ids = this.processedRecord.map((e) => {
          return e[this.entity.metaData.model.idField];
        });
      } else {
        ids = [ids];
      }
      
      // return new Promise( (resolve, reject ) => (
      return await this.knex( this.entity.model.dbTableName )
              .delete()
              .debug( this.debugOn )
              .where (this.entity.metaData.model.idField, 'in',ids )
              .then()
              // .into( this.entity.model.dbTableName )
              // .returning( this.entity.model.idField )
              // .then( rows => (rows[0]) )
              // .then( (rec) => ( resolve( rec ) ) )
      // ))
    }


   /* value( record ) {
        // TODO: parse object and keep only column defined in model
        // should handle object link's field values passed 
        // as ObjectLink: { id: xxx, label: 'xxx' }
        // can use this.entity.parse( record )...

        this.processedRecord = this.toRaw( record );
        return this;
    }*/

    // TODO: declare debug as abstract method of Statement, implemented here
    debug() {
        // TODO: weird use of qb, not used in insert
        // should sets a flag checked when inserting with knex.insert
        this.qb.debug();

        return this;
    }
}

exports.KdbDelete = KdbDelete;
