// var = require('../../db/knex');
// const { ObjectLink, FieldConditionDef, Field, FieldAggregation } = require("../ForteORM");

const { ObjectLink } = require("./Field");
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
    super(entity);
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

  relation(relationName) {
    if (!relationName) {
      return this;
    }
    return this;
  }


  select(columns) {
    if (!columns) {
      return this;
    }
    return this;
  }


  /**Joins with all the related objects
   * 
   * TODO: gets relation from relation set instead scanning 
   * field looking for ObjectLinks. Relations can be different for example 1-n
   */
  joinAllRelated() {
    // ciclo le columns per trovare eventuali objectLink per eseguire le join sulle tabelle target
    Object.entries(this.model.fields)
      .filter(([, field]) => (field instanceof ObjectLink))
      .forEach(([, field]) => {

        this.joinRelated(field);

      });

    return this;
  }

  /**Join a related object... actually identified by a field (to change)
   * TODO: change argument to object related or a relation name instead a field
   * 
   * @param {*} field that identifies the relation (actually true only for ObjectLink)
   * @returns 
   */
  joinRelated(field) {
    // let tableName = this.tableAlias || this.model.dbTableName || this.model.name;

    if ( !field ) {
      throw new Error( `ObjectLink field should not be null.` );
    }
    if ( !(field instanceof ObjectLink)) {
      throw new Error( `Field '${field.name}' is not of type ObjectLink` );
    }
    if ( !field.toEntityName ) {
      throw new Error( `ObjectLink '${field.name}' does not define foreign table. Check your entity definition.` );
    }

    if (this.relateds && this.relateds[field.name]){
      return this;
    }

    this.relateds = {
      ...this.relateds || {},
      [field.name]: field
    };

    // TODO: move following query building part to building phase, 
    // leave here the definition of join only

    // la select non viene fatta qui, ma solo alla fine se non sono state dichiarate altre select
    // this.qb.select(`${foreignTableAlias}.${foreignTableLabel} as ${foreignFieldsAlias}.${foreignTableLabel}`);
    // this.qb.leftOuterJoin(`${foreignTableName} as ${r.foreignTableAlias}`, `${tableName}.${field.sqlSource}`, `${r.foreignTableAlias}.${r.foreignId}`);

    return this;
  }


  where(filters) {

    if (!filters || filters.length === 0) {
      return this;
    }

    if (Array.isArray(filters)) {
      filters.forEach((c) => (this.where(c)));
      return this;
    }

    this.filters = [...(this.filters || []), filters];
    return this;
  }


  andWhere(filters) {
    return this.where(filters);
  }

  pageSize(numberOfRecord) {
    // TODO:
    return this;
  }

  groupBy(column) {
    // does nothing
    if (!column) {
      return this;
    }
    // if columns is array, recursively call for each element
    if (Array.isArray(column)) {
      column.forEach(c => (this.groupBy(c)));
      return this;
    }

    let field;

    if (typeof column === 'string') {
      field = this.model.fields[column];
      if (!field) {
        throw new Error(`Unknown field '${column}' in entity '${this.model.name}'.`);
      }
    }
    else if (column instanceof Field) {
      field = column;
    }
    else {
      throw new Error(`Unsupported field '${column}' in groupBy entity '${this.model.name}'.`);
    }

    this.groups = [...this.groups || [], field];

    return this;
  }

  sortBy(columns) {
    // 
    if (!columns || columns.length === 0) {
      return this;
    }
    if (Array.isArray(columns)) {
      this.orderedColumns = [...this.orderedColumns, ...columns];
    }
    else {
      this.orderedColumns = [...this.orderedColumns, columns];
    }
    return this;
  }

  beforeExec(callback) {
    this.beforeExecCallback = callback;
    return this;
  }

  async execute() {
    // if ( this.beforeExecCallback ) {
    //     await this.beforeExecCallback( this );
    // }
    // 
    if (!this.dataStorage)
      return undefined;

    // TODO: make a plan listing all needed sources
    // TODO: fetch some records from all sources 
    let range = { ...this.range };
    let rsData = [];


    let data = this.dataStorage.getData(range);

    // until end of data or rs has target size

    // TODO: applies filters
    if (this.filters?.length > 0) {
      rsData = [...rsData, ...data.filter((r) => (

        this.filters.every((filter) => (
          filter.match(r)
        ))

      ))];
    }
    else {
      rsData = [...rsData, ...data];
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
  async byId(id) {

    if (typeof id === 'object') {

      let rr = await this.modify(qb => qb.where(id))
        .first();
      return rr;
    }

    return this.where((qb) => (qb[this.model.idField].equals(id)))
      // .where( this[ this.model.idField ].equals( newId ) )
      // .where( { [this.model.idField]: newId } )
      .then((r) => (r[0]));
  }

  async first() {

    let result = await this.exec();
    return result[0];
  }

  /**Gets a record
   * 
   * @param {*} id 
   * @returns 
   */
  async byLabel(value) {

    return await this//.where( (qb) => (qb[ this.model.labelField ].equals( value )) )
      .where(this.entity[this.model.labelField].equals(value))
      .first();
  }

  debug() {

    return this;
  }
}

// module.exports = Query;
exports.Query = Query;
