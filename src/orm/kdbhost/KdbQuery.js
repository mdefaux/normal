/**Knex DB Query is an implementation of abstract Query for db
 * connected with knex library.
 * 
 * TODO: 
 * (done) rename fetch method
 * (done) ensure setup is done always
 * - create knex query builder (this.qb) only after exec is called
 * - move select, join, groupby, order definitions to abstract `Query` class
 * - move readRecord to abstract `Query` class
 * - returning RecordSet
 * - move 'where clause' in super class common with `Update` and `Delete` classes
 * - build 'where clause' in an exernal class used by update and delete
 * 
 */

// const { ObjectLink } = require('../Model');
const { Query } = require('../Query');
const { Field, ObjectLink } = require('../Field');
const { FieldConditionDef, IsNullFieldConditionDef, IsNotNullFieldConditionDef } = require('../FieldConditionDef');
const FieldCondition = require( '../FieldCondition' );
const { FieldAggregation, FieldAggregationCount, FieldAllMainTable } = require('../FieldAggregation');

/**Implementation of abstract Query for db
 * connected with knex library.
 * 
 * @implements Query abstract class
 * 
 */
class KdbQuery extends Query {

    constructor( entity, knex ) {
        super( entity );
        this.knex = knex;
    }

    getAliasFieldName(field) {
        return `__${field}`;
    }

    getAliasTableName(fieldModel) {
    }

    setup() {
        Object.entries(this.entity.metaData.model.fields).forEach(([key, field]) => {
            Object.defineProperty(this, field.name, {
                get: function () {
                    let copy = this.entity.metaData.model.fields[field.name].copy();
                    copy.sourceAlias = this.tableAlias || this.model.dbTableName || this.model.name;
                    return copy;

                    //, this.alias || this.name );
                }
            });

        });
    }

    clone( ref ) {
        let cloned = super.clone( ref || new KdbQuery( this.entity, this.knex ) );
        
        cloned.builtCondition = this.builtCondition;
        cloned.customQB=this.customQB;

        return cloned;
    }

    /**Composes the record adding the related objects
     * TODO: move to abstract Query
     * 
     * @param {*} record 
     * @returns 
     */
    readRecord(record) {
        // definizione oggetto vuoto per ogni ObjectLink
        let related_object = {};
        // let columns = this.columns || Object.entries(this.model.fields).map(([, f]) => (f));
        let columns = this.columns?.length > 0 ? this.columns : []; // Object.entries(this.model.fields).map(([, f]) => (f));

        // Object.entries(this.model.fields)
        columns
            .filter(related => (related.requireObjectRead || related instanceof ObjectLink))
            .forEach((fieldRef) => {
                // popola oggetto con tutti i campi di quell'objectLink + li cancella dal record
                // attualmente gestisce solo i campi idAttribute e labelAttribute della tabella target
                let field = fieldRef instanceof Field ? fieldRef : fieldRef.field;
                let fieldName = fieldRef.requireObjectRead || field.name;
                // let r = field.getSelection();

                // let fieldKey = `${r.foreignFieldsAlias}`;

                // // checks if field was already processed... (column was probabily selected twice)
                // if (!record[fieldKey] && related_object[fieldName])
                //     return;

                related_object[fieldName] = this.readRelated( record, fieldRef, related_object );
            });

        let result = Object.assign({}, record, related_object);
        return this.translateRecord ? this.translateRecord( result ) : result;

        return Object.assign({}, record, related_object);
    }

    readRelated( record, fieldRef, processedRecord ) {
        let field = fieldRef instanceof Field ? fieldRef : fieldRef.field;
        let fieldName = field.name;
        let related_object = processedRecord[fieldName];

        let r = field.getSelection();

        let fieldIdName = fieldRef.leftTableAlias ? 
            `${fieldRef.leftTableAlias}.${field.sqlSource}` : field.sqlSource;
        let fieldKey = `${r.foreignFieldsAlias}`;

        // // checks if field was already processed... (column was probabily selected twice)
        // if (!record[fieldKey] && related_object[fieldName])
        //     return;
        let nested = {};

        if (fieldRef.nested) {
            nested[fieldRef.nested.requireObjectRead] = this.readRelated(record, fieldRef.nested, related_object || {});
        }

        if (related_object && Object.keys(related_object).length > 0) {
            return { ...related_object, ...nested };
        }
        related_object = {
            [r.foreignId]: record[fieldIdName] || processedRecord[fieldName] || null,
            // [r.foreignLabelName]: record[fieldKey],
            ...nested,
        };

        // removes from record the label column of the foreign table
        delete record[fieldKey];
        // removes source field from record 
        // (for example removes 'id_version' and leave 'Version')
        // TODO: configurable behaviour
        if (fieldName !== field.sourceField) {
            delete record[field.sourceField];
        }

        if ( !fieldRef.requireObjectRead ) {
            return related_object;
        }

        // builds the object related
        const tableModel = field.toEntity.metaData.model;
        // for each field moves the value from the record to the related object
        Object.entries( tableModel.fields ).forEach( ([name, relatedField])=>{
            // if( name === tableModel.idField /*|| name === tableModel.labelField*/ ) {
            //     return;
            // }
            // // 
            if( relatedField === fieldRef.nested?.field ) {
                // related_object[name] = this.readRelated( record, fieldRef.nested );
                return;
            }
            if( name === fieldRef.nested?.requireObjectRead ) {
                // related_object[name] = this.readRelated( record, fieldRef.nested );
                return;
            }
            // this.qb.select(`${r.foreignTableAlias}.${relatedField.sqlSource} as ${r.foreignTableAlias}.${relatedField.sqlSource}`);
            // gets the value from the record
            related_object[name] = record[`${r.foreignTableAlias}.${relatedField.sqlSource}`];
            // removes the value from the record
            delete record[`${r.foreignTableAlias}.${relatedField.sqlSource}`];
        });

        return related_object;
    }

    /**TODO: remove metod
     * 
     * @returns 
     */
    fetch() {
        let tableName = this.model.dbTableName || this.model.name;
        this.qb = this.knex(tableName);

        // this.joinAllRelated();

        return this;
    }

    /**TODO: valutate if it is to be removed
     * 
     * @returns 
     */
    fetchWithRelated() {
        let tableName = this.model.dbTableName || this.model.name;
        this.qb = this.knex(tableName);

        this.joinAllRelated();

        return this;
    }


    /**Builds in queryBuilder the join defined in abstract Query
     * 
     * @returns 
     */
    buildJoinRelated() {
        let tableName = this.tableAlias || this.model.dbTableName || this.model.name;

        // for each join
        Object.entries(this.relateds).forEach( ([ , join ]) => {

            const field = join.field;
            // gets the name of the foreign table from the field
            let foreignTableName = this.factory[field.toEntityName].metaData.model.dbTableName;
            
            // gets from field all alias needed for the join building
            let r = field.getSelection();
        
            // la select non viene fatta qui, ma solo alla fine se non sono state dichiarate altre select
            this.qb.leftOuterJoin(`${foreignTableName} as ${r.foreignTableAlias}`, 
                `${join.leftAlias || tableName}.${field.sqlSource}`, 
                `${r.foreignTableAlias}.${r.foreignId}`);
        })
        
        return this;
    }

    modify( callback ) {
        callback( this.qb );
        return this;
    }

    where(conditions) {
        if (!conditions){
            return this;
        }
        if ( Array.isArray(conditions) ) {
            conditions.forEach( (c) => (this.where(c) ) );
            return this;
        }

        let builtCondition = this.buildCondition(conditions);

        // this.builtCondition = [... (this.builtCondition||[]), ...builtCondition];
        this.builtCondition = [... (this.builtCondition||[]),builtCondition];

        return this;
    }

    /**
     * TODO: move to external file used by both KdbUpdate and KdbDelete statement
     * 
     * @param {*} builtCondition 
     * @param {*} qb 
     * @param {*} whereOp 
     * @returns 
     */
    applyWhereCondition(builtCondition, qb, whereOp ) {

        if (builtCondition instanceof FieldConditionDef) {

            // TODO: support multiple conditions +2 (now only one concatenation is allowed)
            if ( builtCondition.chainedCondition ) {
                // const unchain = function( start, accumulator ) {
                //     let next = start.chainedCondition;

                //     return [...accumulator, start, ...unchain( )]
                // }
                // let chain = unchain( builtCondition, [] );
                let chain = [ builtCondition, builtCondition.chainedCondition.next ];
                // https://github.com/knex/knex/issues/2410
                // qb
                // .where('status', status.uuid)
                // .andWhere((qB) => 
                //     qB
                //     .where('firstName', 'ilike', `%${q}%`)
                //     .orWhere('lastName', 'ilike', `%${q}%`)
                // )
                let op = builtCondition.chainedCondition.op;
                chain[ 0 ].chainedCondition = undefined;
                
                qb.andWhere( (qB) => {
                    chain.forEach( (c) => {
                        this.applyWhereCondition( c, qB, op );
                    })
                })
                return this;
            }

            // extracts the value from the ondition
            builtCondition.apply( this );
            let value = builtCondition.value instanceof KdbQuery ?
                // when value is a sub-query, builds it and returns the knex qb object
                builtCondition.value.build().qb :
                // when value is an expression or field
                typeof builtCondition.value === 'object' && builtCondition.value.field instanceof Field ?
                // ...use the raw
                this.knex.raw(builtCondition.sqlValue(this)) :
                // else simply gets the plain value
                builtCondition.sqlValue(this);


            
            if (builtCondition instanceof IsNullFieldConditionDef) {

                qb.whereNull( builtCondition.sqlField(this) );
            }
            else if (builtCondition instanceof IsNotNullFieldConditionDef) {

                qb.whereNotNull( builtCondition.sqlField(this) );
            }
            else if (builtCondition instanceof FieldCondition.textMatch) {

                let viewAlias = builtCondition.field.sourceAlias;

                // base value for psql database
                let whereField = `UPPER( ${builtCondition.sqlStringField( this, "\"" ) } )`;

                if( false && JSON.stringify( this.qb.client.driver ).indexOf( 'PG_DEPENDENCIES' ) > -1 ) {
                    // 
                    qb.where(
                        // builtCondition.sqlField(this),
                        builtCondition.sqlStringField( this ),
                        'ILIKE',
                        typeof value === 'string' ? value.toUpperCase() :
                            this.knex.raw( `UPPER( ${value} )` )
                    );
                }

                // overwrite for mysql database
                else if ( this.qb.client.config.client === 'mysql' ) {
                    whereField = `UPPER( ${builtCondition.sqlStringField( this, "\`" ) } )`;
                    // 
    /*                 qb.where(
                        whereField,
                        //this.knex.raw( `UPPER( ${builtCondition.sqlStringField( this, "\`" ) } )` ),
                        // this.knex.raw( `UPPER( \`${viewAlias}\`.\`${builtCondition.field.name}\` )` ),
                        // this.knex.raw( `UPPER( ${builtCondition.sqlField(this)} )` ),
                        builtCondition.type,
                        typeof value === 'string' ? value.toUpperCase() :
                            this.knex.raw( `UPPER( ${value} )` )
                    ); */
                }

                // Overwrite the field with the calculated one for calc Fields.
                if (builtCondition?.field?.calc ||  builtCondition?.field?.field?.calc) {
                    let calcFunction = builtCondition.field.calc ||   builtCondition.field.field?.calc;
                    let tableName = this.entity.model.dbTableName;
                    let type = 'CHAR'

                    if(JSON.stringify( this.qb.client.driver ).indexOf( 'PG_DEPENDENCIES' ) > -1 ) type = 'VARCHAR'



                    whereField = ` CAST(${calcFunction(tableName)} AS ${type}) `;
                    //whereField = this.knex.raw(calcField);

                }

                // Overwrite the field with the calculated one for concat Fields.
                if (builtCondition?.field?.concat ||  builtCondition?.field?.field?.concat) {
                    let concatValues = builtCondition.field.concat ||   builtCondition.field.field?.concat;
                   // let tableName = this.entity.model.dbTableName;
                    let type = 'CHAR'

                    if(JSON.stringify( this.qb.client.driver ).indexOf( 'PG_DEPENDENCIES' ) > -1 ) type = 'VARCHAR'

                    let concatString = this.getConcatString(concatValues);

                    whereField = ` CAST(UPPER(${concatString}) AS ${type}) `;
                  //  whereField = ` ${concatString} `;
                    //whereField = this.knex.raw(calcField);

                }

         
                qb.where(
                    this.knex.raw(whereField),
                    builtCondition.type,
                    typeof value === 'string' ? value.toUpperCase() :
                    this.knex.raw( `UPPER( ${value} )` )
                );
/*                 else {
                    whereField = this.knex.raw( `UPPER( ${builtCondition.sqlStringField( this, "\"" ) } )` );
                    // 
                    qb.where(
                        whereField,
                        //this.knex.raw( `UPPER( ${builtCondition.sqlStringField( this, "\"" ) } )` ),
                        // this.knex.raw( `UPPER( "${viewAlias}"."${builtCondition.field.name}" )` ),
                        // this.knex.raw( `UPPER( ${builtCondition.sqlField(this)} )` ),
                        builtCondition.type,
                        typeof value === 'string' ? value.toUpperCase() :
                            this.knex.raw( `UPPER( ${value} )` )
                    );
                } */
            }
            else {
                // TODO: use sqlStringField 
                // TODO: dynamic change the method called qb[ whereFunction ]( ... )
                if ( whereOp === 'or' ) {
                    qb.orWhere(
                        builtCondition.sqlField(this),
                        builtCondition.type,
                        value
                    );
                }
                else if (builtCondition?.field?.calc ||  builtCondition?.field?.field?.calc) {
                    let calcFunction = builtCondition.field.calc ||   builtCondition.field.field?.calc;
                    let tableName = this.entity.model.dbTableName;

                    let calcField = calcFunction(tableName);

                    qb.where(
                        this.knex.raw(calcField),
                        builtCondition.type,
                        value
                    );

                }
                else if (builtCondition?.field?.concat ||  builtCondition?.field?.field?.concat) {
                    let concatValues = builtCondition.field.concat ||  builtCondition.field.field?.concat;
                    let concatString = this.getConcatString(concatValues);
                    // let calcField = calcFunction(tableName);
                    let whereField = `UPPER(${concatString})`;

                    qb.where(
                        this.knex.raw(whereField),
                        builtCondition.type,
                        value
                    );

                }
                else {
                    qb.where(
                        builtCondition.sqlField(this),
                        builtCondition.type,
                        value
                    );
                }
            }
        }

        else {
            if ( typeof builtCondition === 'function' ) {

                let rebuilt = this.buildCondition(builtCondition(this));
                
                if (rebuilt instanceof FieldConditionDef) {
                    qb.andWhere(
                        rebuilt.sqlField(this),
                        rebuilt.type,
                        rebuilt.sqlValue(this)
                    );
                }

                else {
                    qb.andWhere(rebuilt);
                }
            }
            else {
                qb.where(builtCondition);
            }
        }

        return this;
    }

    getConcatString(concatValues) {

        if(!concatValues || concatValues.length <= 0 || !Array.isArray(concatValues) ) return '';

        let condition = 'CONCAT(';

        for(let val of concatValues) {
            let sanitized = this.checkConcatValue(val);
            if(sanitized) {
                condition = condition.concat( sanitized, ',');
            }
        }

        // remove last ',' char
        condition = condition.slice(0, -1); 
        condition = condition.concat(')');

        return condition;

    }

    checkConcatValue(value) {
        if(!value) return '';
        if(value === ' ') return "' '";

        if(typeof(value) === 'string') {
            let fieldValue = this.sanitizeValue(value);
            return `${this.model.dbTableName}.${fieldValue}`;
        }

        return this.sanitizeValue(value);
    }

    sanitizeValue(value) {
        return value;
    }

    andWhere(conditions) {
        return this.where( conditions );
    }

    /**
     * TODO: rename to defineContdition as for build we intend 
     * the final query building over knex qb.
     * 
     * @param {*} conditions 
     * @returns the set of defined condition
     */
    buildCondition(conditions) {

        if (!conditions)
            return false;

        if (Array.isArray(conditions)) {
            
            return conditions.map(c => (this.buildCondition(c)));
        }

        if (typeof conditions === 'function') {
            return this.buildCondition(conditions(this));
            return conditions; // this.buildCondition(conditions(this));
        }
        else if (typeof conditions === 'object') {

            // handles case of normaly defined conditions
            // TODO: extract to method
            if (conditions instanceof FieldConditionDef) {

                // checks for column alias. This is important to avoids column ambiguity
                // for e.g.: .where( Partnumber.id ) if translated into `where id=?` 
                if ( conditions.field && !conditions.field.sourceAlias ) {
                    // if the condition refers to a column of main query entity
                    if ( this.entity && conditions.field.sourceEntity.metaData.name === this.entity.metaData.name ){
                        conditions.field.sourceAlias = this.tableAlias || this.model.dbTableName || this.model.name;
                        
                        return conditions;
                    }
                    // now the condition refers to another entity... looks if the other entity is joined in the query
                    // if no joins defined... throws exception
                    if ( !this.relateds || Object.keys(this.relateds).length === 0 ) {
                        throw new Error( `The query has no joins.`);
                    }
                    // finds a joined related table with the source entity of the condition
                    let related = Object.entries(this.relateds).find( ([,r]) => r.field.toEntity === conditions.field.sourceEntity)

                    // TODO: handle the case in which more related matches....... and throws an exception

                    // TODO: useful?
                    if ( this.relateds[ conditions.field./*sourceEntity?.metaData?.model?.*/name ] ) {
                        // loooks for alias in related table
                        let alias = this.related[ conditions.field./*sourceEntity.metaData.model.*/name ]?.joinedTableAlias;
                        conditions.field.sourceAlias = alias;
                    }
                    else if ( related ) {
                        // loooks for alias in related table
                        let alias = related[1].joinedTableAlias;
                        conditions.field.sourceAlias = alias;
                    }
                }
                return conditions;
            }

            // maps field name to field sources
            return Object.fromEntries(
                Object.entries(conditions)
                    .map(([fieldName, value]) => {
                        let field = this.model.fields[fieldName];

                        return [field?.sqlSource || fieldName, value];
                    })
            );
        }

        return conditions;
    }


    buildSelect(fieldsList) {

        // if fields is passed, it's the only elaboration made.
        // otherwise, check groupBy condition, then select conditions.
        let fields = fieldsList || this.columns;
        let tableName = this.tableAlias || this.model.dbTableName || this.model.name;

        if ( !fields ) {
            fields = Object.entries(this.entity.metaData.model.fields).map( ([,f]) => (f) );
        }

        let field;

        if( !this.qb )
        {
            this.fetch();
        }

      
        // handle groupBy
        if (this.groups && (!fields || fields.length === 0)) {
            this.groups.forEach(e => {
                if (e instanceof ObjectLink) {
                    this.selectRelatedDetails(e);
                }

                field = this.model.fields[e.name];
                if (!field)
                    throw new Error(`Unknown field '${e}' in entity '${this.model.name}'.`);

                let tableName = this.tableAlias || this.model.dbTableName || this.model.name;
                this.qb.select(`${tableName}.${field.sqlSource}`);


            });

            return this;
        }

        // handle FieldAggregationCounts
        if ( fields.find( (c) => ( c instanceof FieldAggregationCount || c === 'COUNT' ) ) || 
        (this.limit == 0 && this.offset == -1 ) ) {

            this.qb.count('*', {as: 'COUNT'});
            return this;
        }

        // if selected filed is empty, takes all columns with *
        if ( fields.length === 0 || fields.find( (c) => ( c instanceof FieldAllMainTable ) ) ) {
            this.qb.select( `${tableName}.*` );

        // if there is any objectLink, add its columns to selection
            // let ObjLinks = Object.entries(this.entity.metaData.model.fields).reduce((tot, [k, f]) => { 
            //     if(f instanceof ObjectLink) {tot.push(f); }
            //     return tot;
            // }, [] );

            fields = this.columns = Object.entries(this.entity.metaData.model.fields).reduce( (acc, [k, f]) => { 

                // TODO: check if column already present

                return [...acc, f]; // change in: return [...acc, f.copy()]  ???
            }, this.columns );

            // ObjLinks.forEach(f => {
            //     this.selectRelatedDetails(f);
            // });

        }

        // checks for field type: select, aggregation, object links...

        fields.forEach(f => {
            if (typeof f === 'string') {
                field = this.model.fields[f];
                if (!field)
                    throw new Error(`Unknown field '${f}' in entity '${this.model.name}'.`);
    
                // adds column to select clause
                this.qb.select(`${tableName}.${field.sqlSource}`);
    
            }
    
            if (typeof f === 'object' && f instanceof FieldAggregation 
                && !(f instanceof FieldAggregationCount) 
                && !(f instanceof FieldAllMainTable) ) 
            {
                f.toQuery(this);
                field = f.field;
                return this;
            }
            
            if (typeof f === 'object' && f.field instanceof Field
                // TODO: checks if instanceof FieldQueryItem
                // && !(f instanceof FieldAggregationCount) 
                // && !(f instanceof FieldAllMainTable) 
            ) {

                if(f.field.calc && typeof f.field.calc === 'function') {
                    let calcField = f.field.calc(tableName);
                    this.qb.select(this.knex.raw(`${calcField} as ${f.field.name} `));
                } 
                else if(f.field.concat && Array.isArray(f.field.concat)) {
                  //  let calcField = f.field.calc(tableName);
                    let concatString = this.getConcatString(f.field.concat);
                    this.qb.select(this.knex.raw(`${concatString} as ${f.field.name} `));
                } 
                else {
                    // adds column to select clause
                    this.qb.select(`${tableName}.${f.field.sqlSource}`);
                }
                
            }
    
            // TODO: change relateds keys to entity name
            // .............................................
            if (/*f instanceof ObjectLink &&*/ this.relateds[f.field?.name] ) {
                this.selectRelatedDetails(f);
            }
            if( f.calc && typeof f.calc === 'function') {
                // 1 : sqlSource -- mi servirebbe l'alias, prob non lo ho
                // 2 : chiamo direttamente la calc?
                 let calcField = f.calc(tableName);
                // let selectExpression = fieldQueryItemCopy.sqlSource;
                

               // this.qb.select(selectExpression);
                this.qb.select(this.knex.raw(` ${calcField} as ${f.name} `));
            }
            if( f.concat && Array.isArray(f.concat)) {
                let concatString = this.getConcatString(f.concat);

                this.qb.select(this.knex.raw(` ${concatString} as ${f.name} `));
            }
    
        });
        return this;
    }

    buildSorting() {

        if ( this.orderedColumns.length === 0 ) {
            return;
        }
        // this.qb.orderBy( this.orderedColumns[0].columnName, this.orderedColumns[0].order );
        // TODO: use model instead query fields
        this.orderedColumns.forEach( (column) => {

            let relatedColumn = this.columns.find( (c) => c.field?.name === column.columnName );
            let fieldColumn = this.columns.find( (col) => col.name === column.columnName  );

            if ( relatedColumn ) {

                let r = relatedColumn.field.getSelection();
                // builds the object related
                const tableModel = relatedColumn.field.toEntity.metaData.model;
                const labelField = tableModel.fields[ tableModel.labelField ];

                this.qb.orderBy( `${r.foreignTableAlias}.${labelField.sqlSource}`, column.order );

            } 
            else if (fieldColumn?.calc && typeof fieldColumn?.calc === 'function') {
                let tableName = this.tableAlias || this.model.dbTableName || this.model.name;
                let calcField = fieldColumn.calc(tableName);

                this.qb.orderByRaw(`${calcField} ${column.order}`);
            }
            else if (fieldColumn?.concat && Array.isArray(fieldColumne?.concat)) {
                let concatString = this.getConcatString(fielColumn.concat);

                this.qb.orderByRaw(`${concatString} ${column.order}`);
            }
            else if ( column.columnName ){
                if(!this[column.columnName]) {
                        throw new Error(`Ordering column '${column.columnName}' not found in entity '${this.entity.metaData.name}'`);
                    }
                this.qb.orderBy( this[ column.columnName ].sqlSource, column.order );
            }
        })
    }

    // selectAllRelated() {
    //     if (!this.relateds)
    //         return;

    //     Object.entries(this.relateds).forEach(([, field]) => {
    //         this.columns = [...this.columns || [], field];
    //         this.selectRelatedDetails(field);
    //     });
    // }

    selectRelatedDetails(related) {
        // ensure the foreign table is related. 
        // If already present in relateds map, does nothing
        // this.joinRelated(field);
        let field = related instanceof Field ? related : related.field;

        // adds the label field
        let r = field.getSelection();
        // this.qb.select(`${r.foreignTableAlias}.${r.foreignTableLabel} as ${r.foreignFieldsAlias}`);

        // if( this.groups?.length > 0 ) {
        //     this.groups = [...this.groups, field ];
        // }

        const tableModel = field.toEntity.metaData.model;
        // select all other fields 
        Object.entries( tableModel.fields ).forEach( ([name, relatedField])=>{
            // if( name === tableModel.idField /*|| name === tableModel.labelField*/ ) {
            //     return;
            // }
            if(relatedField.concat && Array.isArray(relatedField.concat)) {
                let concatString = this.getConcatString(relatedField.concat);
                this.qb.select(this.knex.raw(`${concatString} as ${r.foreignTableAlias}.${relatedField.sqlSource} `));
            } else {
                this.qb.select(`${r.foreignTableAlias}.${relatedField.sqlSource} as ${r.foreignTableAlias}.${relatedField.sqlSource}`);
            }
            
            
            if( this.groups?.length > 0 ) {
                let wrap = field.toEntity[name];
                wrap.sourceField =  `${r.foreignTableAlias}.${relatedField.sqlSource}`;
                this.groups = [...this.groups, wrap ];
            }
        });
        
        // TODO: handle nested as array
        if ( related.nested ) {
            this.selectRelatedDetails( related.nested );
        }
    }

    buildGroupBy() {
        if (!this.groups) return this;

        this.groups.forEach((wrap) => {
            let tableName = this.tableAlias || this.model.dbTableName || this.model.name;
            let sourceSql = (wrap.sourceAlias && wrap.sourceField) 
                            ? `${wrap.sourceAlias}.${wrap.sourceField}` 
                            : wrap.sourceField || `${tableName}.${wrap.field.sqlSource}`;
            
            // la groupBy non fa anche la select /*.select( field.source )*/
            
            if (wrap?.field?.calc && typeof wrap?.field?.calc === 'function') {
                let calcField = wrap.field.calc(tableName);
                
                this.qb.groupBy(this.knex.raw(`${calcField}`));
                //sourceSql = this.knex.raw(`${calcField}`);
            } else if (wrap?.field?.concat &&  Array.isArray(wrap?.field?.concat)) {
                let concatField = this.getConcatString(wrap?.field?.concat);
                
                this.qb.groupBy(this.knex.raw(`${concatField}`));
                //sourceSql = this.knex.raw(`${calcField}`);
            } else {
                this.qb.groupBy(sourceSql);
            }

            // if (wrap.field instanceof ObjectLink) {
            //     let r = wrap.field.getSelection();
            //     this.qb.groupBy(`${r.foreignTableAlias}.${r.foreignTableLabel}`);
            //     this.joinRelated(wrap);
            // }
        })

        return this;
    }

    alias(tableAlias) {
        let tableName = this.model.dbTableName || this.model.name;
        this.tableAlias = tableAlias;
        this.qb = this.knex({ [this.tableAlias]: tableName });
        return this;
    }

    ancestors(parentIdField, startingId) {
        let tableName = this.model.dbTableName || this.model.name;
        let idColumn = this.model.idField; // id column for current table
        let parentIdColumn = parentIdField; // field that defines parenthsip;



        // da ora in poi la query dev'essere fatta su questa tabella virtuale
        this.tableAlias = `ancestor_${tableName}`;

        // http://knexjs.org/#Builder-withRecursive
        this.qb = this.knex.withRecursive(this.tableAlias, (qb) => {
            qb.select(`${tableName}.*`)
                .from(tableName)
                .where(`${tableName}.${idColumn}`, startingId)
                .union((qb) => {
                    qb.select(`${tableName}.*`)
                        .from(tableName)
                        .join(this.tableAlias,
                            `${this.tableAlias}.${parentIdColumn}`,
                            `${tableName}.${idColumn}`
                        );
                });
        }).from(this.tableAlias);

        return this;
    }

    relation( relationName )
    {
        if ( !relationName ) {
            return this;
        }

        if( relationName === 'Versione' )
        {
            let tableName = this.model.dbTableName || this.model.name;
            let foreignTableName = 'ver_componente_progetto';
            let r = {
                foreignTableAlias: 'ver_componente_progetto',
                sourceField: 'id',
                foreignId: 'id_componente'
            }
            this.qb.join(`${foreignTableName} as ${r.foreignTableAlias}`, 
                `${tableName}.${r.sourceField}`, 
                `${r.foreignTableAlias}.${r.foreignId}`);
        
        }

        return this;
    }


    /** Limits the resultSet to a specific page 
     * 
     * @param {int} page  number of page, 1+
     * @param {int} limit number of records per page, same as pageSize.
     * @param {int} offset starting record to return, 1+ 
     * @returns 
     * @example page(2, 100)   second page of 100 records, from record 101 to 200
     * @example page(null, 100, 101)  100 records starting from record 101
     */
     page(page, limit, offset) {
        if(page) {
         this.limit = limit || this.limit || 50;
         this.offset =  ((parseInt(page) -1)*this.limit);

         return this;
        }

        this.limit = limit || this.limit ||  50;
        this.offset = parseInt(offset-1) || this.offset ||  0;


        return this;
    }

    build() {
if(this.customQB){
    this.qb=this.customQB;
}
        if ( !this.qb ) {
            let tableName = this.model.dbTableName || this.model.name;
            this.qb = this.knex(tableName);
        }
        // let countAllMode = false;

        // builds filter condition
        this.builtCondition?.forEach( (bc) => {
            this.applyWhereCondition(bc, this.qb);
        });

        // builds select clause
        this.buildSelect();

        this.buildJoinRelated();
        
        // builds group by
        this.buildGroupBy();
        
        // builds sorting
        this.buildSorting();
        
        
        
        let limit = parseInt(this.limit) >= 0 ? parseInt(this.limit) : 50;
        //  let offset = parseInt(this.pageNumber) > 1 ? (parseInt(limit) * (parseInt(this.pageNumber)-1)) +1 : 0;
        let offset = parseInt(this.offset) || 0;
        
        if(limit !== 0 && offset !== -1) {
            // TODO: ensures that Order By is used: 
            // OrderBy is mandatory in pagination for certain DB
            // https://dba.stackexchange.com/questions/167562/how-to-solve-invalid-usage-of-the-option-next-in-the-fetch-statement
            // https://github.com/adonisjs/lucid/issues/386
            // 
            this.qb.limit(limit).offset(offset);
        }
        
        if ( this.debugOn ) {
            this.qb.debug();
        }

        return this;
    }

    async execute() {

        return this.qb.then(result => {
            // ottenuto il risultato primario, esegue le query dipendenti
            // TODO: Promise.all( Object.entries( this.relatedQuery ).map( ... ) )

            // qb reset; otherwise it will chain conditions on same qb if called later.
            this.qb = null;
            if(this.limit == 0 && this.offset == -1) {
                if ( result[0]?.COUNT !== undefined ) {
                    return [{ ...result[0], COUNT: parseInt( result[0].COUNT ) }];
                }
                return [{COUNT: result.length}];
            }
            return result.map((rec) => (this.readRecord(rec)));
        })
    }
}

exports.KdbQuery = KdbQuery;
