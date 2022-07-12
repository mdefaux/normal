// var = require('../../db/knex');
// const { ObjectLink, FieldConditionDef, Field, FieldAggregation } = require("../ForteORM");


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
class Query {

  constructor(entity) {
    this.entity = entity;
    this.model = entity.model;
    this.factory = entity.factory;
    
    this.columns = false;
    this.relateds = false;
    this.joins = false;
    this.groupeds = false;
    this.range = { start: 0, size: 50 };

    this.setup();
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
    return this;
  }
  
  groupBy(columns) {
    // 
    if ( !columns ) {
      return this;
    }
    return this;
  }
  
  then(callback) {
    // 
    if( !this.dataStorage )
      return Promise.resolve( callback( [] ) );

    // TODO: make a plan listing all needed sources
    // TODO: fetch some records from all sources 
    // until end of data or rs has target size

    // TODO: applies filters

    // TODO: applies groupby
    
    let data = this.dataStorage.getData().slice( 
      this.range.start, this.range.start + this.range.size
    );

    return Promise.resolve( callback( data ) );
  }

  debug() {

    return this;
  }
}

module.exports = Query;
