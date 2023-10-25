/* Query.js file defines Query class
 *
 */
const { ObjectLink, Field } = require("./Field");
const { Statement } = require("./Statement");
const { FieldAggregation, FieldAggregationCount, FieldAllMainTable } = require('./FieldAggregation');
const { FieldQueryItem } = require("./FieldConditionDef");


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

  clone( ref ) {
    let cloned = super.clone( ref || new Query( {} ) );

    
    cloned.model = this.model;
    cloned.factory = this.factory;

    cloned.columns = this.columns;
    cloned.relateds = this.relateds;
    cloned.joins = this.joins;
    cloned.groups = this.groups;
    cloned.orderedColumns = this.orderedColumns;
    cloned.range = this.range;

    return cloned;
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


  // select(columns) {
  //   if (!columns) {
  //     return this;
  //   }
  //   return this;
  // }
  
  select(column) {
    // if ( typeof column === 'function' ) {
    //     this.translateRecord = column;
    //     return this;
    // }

    if ( column === false ) {
        return this;
    }

    // if ( column === '*' || column === undefined ) {
    //     this.columns = [...this.columns || [], new FieldAllMainTable()];
    //     return this;
    // }

    if (Array.isArray(column)) {
        // column.forEach(c => (this.select(c)));

        this.columns = [...this.columns || [], ...column.map( ((c)=>(this.selectColumn(c))))];
        return this;
    }

    this.columns = [...this.columns || [], this.selectColumn(column)];

    return this;
}

selectColumn( column ) {
  if ( typeof column === 'function' ) {
      this.translateRecord = column;
      return this.translateRecord;
  }

  if ( column === false ) {
      return false;
  }

  if ( column === '*' || column === undefined ) {
      return new FieldAllMainTable();
  }

  if ( this.model.fields[ column ] ) {
    
    return this.chainSelectedColum( [column] );
  }
  if ( /*column instanceof FieldQueryItem && */ column.field instanceof ObjectLink ) {
    
    return this.chainSelectedColum( [column] );
  }
  if ( column instanceof ObjectLink ) {
    assert( false );
    return this.chainSelectedColum( [column] );
  }
  else if ( typeof column === 'string' && column.split('.').length > 1 ) {

    let columnSeq = column.split('.');
    return this.chainSelectedColum( columnSeq );
  }

  return column;
}

/**
 * 
 * @param {*} columnSeq - array of column names
 * @param {*} entity 
 * @param {*} leftTableAlias 
 * @returns 
 */
chainSelectedColum( columnSeq, entity, leftTableAlias ) {
  // if there are no more entries in column array, stops recursion
  if( columnSeq.length === 0 ) {
    return false;
  }
  // process the first entry of columnSeq
  const columnName = columnSeq.shift();

  if ( !columnName ) {
    return false;
  }

  // gets the fields
  let fieldWrapper = columnName.field instanceof ObjectLink ? columnName
    // : columnName instanceof ObjectLink ? columnName
    : entity ? entity/*.metaData.model.fields*/[ columnName ] 
    : this[ columnName ]; // this.model.fields[ columnName ];

  if ( !fieldWrapper ) {
    throw new Error( `Unknown column '${columnName}' in Entity '${entity?entity.metaData.name:this.model.name}'.`)
  }

  // gets the fields
  let field = fieldWrapper.field;
  // let field = columnName.field instanceof ObjectLink ? columnName.field
  //   : columnName instanceof ObjectLink ? columnName
  //   : entity ? entity/*.metaData.model.fields*/[ columnName ] 
  //   : this[ columnName ]; // this.model.fields[ columnName ];

  let columnSelection = {
    field: field,
    leftTableAlias: leftTableAlias
  }
  if ( field instanceof ObjectLink ) {
    this.joinRelated(fieldWrapper, entity, entity&& leftTableAlias );

    
    // field.relateds = this.chainSelectedColum( columnSeq, field.toEntity, field.getSelection().foreignTableAlias );
    columnSelection = { ...columnSelection,
      nested: this.chainSelectedColum( columnSeq, field.toEntity, field.getSelection().foreignTableAlias ),
      foreignTableAlias: field.getSelection().foreignTableAlias,
      idFieldKey: leftTableAlias ? `${leftTableAlias}.${field.sqlSource}` : field.sqlSource,
      requireObjectRead: field.name
    }
  }

  return columnSelection;
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

        this.joinRelated( this.entity[ field.name ] );
        // this.select( this.entity[ field.name ] );

      });

    return this;
  }
  /**Joins with all the related objects
   * 
   * TODO: gets relation from relation set instead scanning 
   * field looking for ObjectLinks. Relations can be different for example 1-n
   */
  selectAllRelated( condition ) {
    if ( condition === false ) {
      return this;
    }
    // ciclo le columns per trovare eventuali objectLink per eseguire le join sulle tabelle target
    Object.entries(this.model.fields)
      .filter(([, field]) => (field instanceof ObjectLink))
      .forEach(([, field]) => {

        // this.joinRelated( this.entity[ field.name ] );
        this.select( this.entity[ field.name ] );

      });

    return this;
  }

  /**Join a related object... actually identified by a field (to change)
   * TODO: change argument to object related or a relation name instead a field
   * 
   * @param {*} field that identifies the relation (actually true only for ObjectLink)
   * @returns 
   */
  joinRelated(fieldWrapper, leftEntity, leftTableAlias) {
    if ( !fieldWrapper ) {
      throw new Error( `ObjectLink field should not be null.` );
    }
    // let tableName = this.tableAlias || this.model.dbTableName || this.model.name;
    let field = fieldWrapper.field;

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

    let foreignTableName = field.factory[field.toEntityName].metaData.model.dbTableName;
    let foreignLabelName = field.factory[field.toEntityName].metaData.model.labelField;
    let foreignLabelField = field.factory[field.toEntityName].metaData.model.fields[ foreignLabelName ];
    if (!foreignLabelName) {
        throw new Error (`NORMALY-0003 Table '${field.toEntityName}' missing label definition.` );
    }
    if (!foreignLabelField) {
        throw new Error (`NORMALY-0004 Table '${field.toEntityName}' wrong label definition, column with name '${foreignLabelName}'  dosen't exist.` );
    }
    // let foreignTableLabel = foreignLabelField.sqlSource;
    // let foreignId = this.factory[field.toEntityName].model.idField;
    // let foreignFieldsAlias = `_c_${this.name}`; // this.getAliasFieldName(this.name);
    let foreignTableAlias = `_jt_${foreignTableName.toUpperCase()}_${field.name}`;

    this.relateds = {
      ...this.relateds || {},
      [field.name]: {
        field: field,
        leftAlias: leftTableAlias, // && '_jt_PARTNUMBER_Partnumber'
        idFieldKey: leftTableAlias ? `${leftTableAlias}.${field.sqlSource}` : field.sqlSource,
        requireObjectRead: field.name,
        joinedTableAlias: foreignTableAlias
      }
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
      // field = this.model.fields[column];
      field = this[column]; // TODO: use of getColumnRef ?
      if (!field) {
        throw new Error(`Unknown field '${column}' in entity '${this.model.name}'.`);
      }
    }
    else if (column instanceof Field) {
      field = column.copy();
    }
    else if (column instanceof FieldQueryItem) {
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

  orderBy(order) {
    // il secondo parametro della orderBy è l'ordinamento di default...sarebbe da inserire nel model
    // let order = utils.orderBy(this.req.query, "id");
    // this.qb.orderBy(order.field, order.order);
    this.sortBy( order );

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

      let rr = await this.where( id ) // modify(qb => qb.where(id))
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
}

// module.exports = Query;
exports.Query = Query;
