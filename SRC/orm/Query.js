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

    this.setup();
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

  
  groupBy(columns) {
    if ( !columns ) {
      return this;
    }
    return this;
  }
  
  then(callback) {
    // 
  }

  debug() {

    return this;
  }
}

exports.Query = Query;
