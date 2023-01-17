// var = require('../../db/knex');
// const { ObjectLink, FieldConditionDef, Field, FieldAggregation } = require("../ForteORM");

const { Statement } = require("./Statement");


/**Oggetto per creare una query ed ottenere un recordset.
 * La query viene creata dalla Entity invocando i metodi
 * Entity.fetch oppure Entity.query
 * Esempio:
 *
   Versione
    .fetch()
    .where( { Progetto: req.params.id_progetto } )
    .then(record => {
      res.send(record);
    })
 *
 *
 */
class Query extends Statement {

  constructor(entity) {
    super( entity );
    // this.entity = entity;
    this.model = entity.model;
    this.factory = entity.factory;
    
    this.columns = false;
    this.relateds = false;
    this.joins = false;
    this.groups = false;
    this.orderedColumns = [];
    this.range = { start: 0, size: 50 };
  }

  setup() {

  }

  fetch() {
    return this;
  }

  relation( relationName ) {
    if ( !relationName ) {
      return this;
    }
    return this;
  }


  select(columns) {
    if ( !columns ) {
      return this;
    }
    return this;
  }


  joinAllRelated() {
    
    return this;
  }

  where( filters ) {

    if ( !filters || filters.length === 0 ) {
      return this;
    }
    
    if ( Array.isArray(filters) ) {
      filters.forEach( (c) => (this.where(c) ) );
      return this;
    }

    this.filters = [...(this.filters || []), filters ];
    return this;
  }
  

  andWhere( filters ) {
    return this.where( filters );
  }

  pageSize( numberOfRecord ) {
    // TODO:
    return this;
  }
  
  groupBy(columns) {
    // 
    if ( !columns ) {
      return this;
    }
    return this;
  }
  
  sortBy(columns) {
    // 
    if ( !columns || columns.length === 0 ) {
      return this;
    }
    if ( Array.isArray(columns) ) {
      this.orderedColumns = [ ...this.orderedColumns, ...columns ];
    }
    else {
      this.orderedColumns = [ ...this.orderedColumns, columns ];
    }
    return this;
  }

  beforeExec( callback ) {
    this.beforeExecCallback = callback;
    return this;
  }
  
  async execute() {
    // if ( this.beforeExecCallback ) {
    //     await this.beforeExecCallback( this );
    // }
    // 
    if( !this.dataStorage )
      return undefined;

    // TODO: make a plan listing all needed sources
    // TODO: fetch some records from all sources 
    let range = {...this.range};
    let rsData = [];


    let data = this.dataStorage.getData( range );

    // until end of data or rs has target size

    // TODO: applies filters
    if ( this.filters?.length > 0 ) {
      rsData = [...rsData, ...data.filter( (r) => (

        this.filters.every( (filter) => (
          filter.match( r )
        ) )

      )) ];
    }
    else {
      rsData = [...rsData, ...data ];
    }
    // TODO: applies groupby
    

    return rsData; // Promise.resolve( callback( rsData ) );
  }

  then(callback) {

      return this.exec().then(callback);
  }

  /**Gets a record
   * 
   * @param {*} id 
   * @returns 
   */
  async byId( id ) {

    if ( typeof id === 'object' ) {

        let rr = await this.modify( qb => qb.where( id ) )
            .first();
        return rr;
    }

    return this.where( (qb) => (qb[ this.model.idField ].equals( id )) )
        // .where( this[ this.model.idField ].equals( newId ) )
        // .where( { [this.model.idField]: newId } )
        .then( (r) => ( r[0] ));
  }

  debug() {

    return this;
  }
}

// module.exports = Query;
exports.Query = Query;
