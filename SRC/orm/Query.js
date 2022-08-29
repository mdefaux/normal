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
    this.groups = false;
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
    if ( !filters || filters.length === 0 ) {
      return this;
    }
    this.filters = [...(this.filters || []), ...filters ];
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
    

    return Promise.resolve( callback( rsData ) );
  }

  debug() {

    return this;
  }
}

// module.exports = Query;
exports.Query = Query;
