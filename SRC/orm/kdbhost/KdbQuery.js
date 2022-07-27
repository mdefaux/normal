
// const { ObjectLink } = require('../Model');
const { Query } = require('../Query');
const { Field, ObjectLink } = require('../Field');
const { FieldConditionDef } = require('../FieldConditionDef');
const { FieldAggregation, FieldAggregationCount } = require('../FieldAggregation');

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
        Object.entries(this.entity.model.fields).forEach(([key, field]) => {
            Object.defineProperty(this, field.name, {
                get: function () {
                    let copy = this.entity.model.fields[field.name].copy();
                    copy.sourceAlias = this.tableAlias || this.model.dbTableName || this.model.name;
                    return copy;

                    //, this.alias || this.name );
                }
            });

        });
    }

    readRecord(record) {
        // definizione oggetto vuoto per ogni ObjectLink
        let related_object = {};
        let columns = this.columns || Object.entries(this.model.fields).map(([, f]) => (f));

        // Object.entries(this.model.fields)
        columns
            .filter(field => (field instanceof ObjectLink))
            .forEach((field, index) => {
                // popola oggetto con tutti i campi di quell'objectLink + li cancella dal record
                // attualmente gestisce solo i campi idAttribute e labelAttribute della tabella target
                let fieldName = field.name;
                let r = field.getSelection();

                let fieldKey = `${r.joinedFieldsAlias}.${r.joinTableLabel}`;

                // checks if field was already processed... (column was probabily selected twice)
                if (!record[fieldKey] && related_object[fieldName])
                    return;

                related_object[fieldName] = {
                    [r.joinTableId]: record[field.sqlSource],
                    [r.joinTableLabel]: record[fieldKey]
                };

                delete record[fieldKey];
            });

        return Object.assign({}, record, related_object);
    }

    fetch() {
        let tableName = this.model.dbTableName || this.model.name;
        this.qb = this.knex(tableName);

        // this.joinAllRelated();

        return this;
    }

    fetchWithRelated() {
        let tableName = this.model.dbTableName || this.model.name;
        this.qb = this.knex(tableName);

        this.joinAllRelated();

        return this;
    }

    joinAllRelated() {
        // ciclo le columns per trovare eventuali objectLink per eseguire le join sulle tabelle target
        Object.entries(this.model.fields)
            .filter(([, field]) => (field instanceof ObjectLink))
            .forEach(([, field]) => {

                this.joinRelated(field);

            });

        return this;
    }

    joinRelated(field)
    {
        let tableName = this.tableAlias || this.model.dbTableName || this.model.name;

        if( this.relateds && this.relateds[ field.name ] )
            return this;

        let joinTable = this.factory[field.toEntityName].model.dbTableName;
        // let joinTableLabel =  this.factory[field.toEntityName].model.labelField;
        // let joinTableId = this.factory[field.toEntityName].model.idField;
        // let joinedFieldsAlias = this.getAliasFieldName(field.name);
        // let joinedTableAlias = `${joinTable}${index}`;
        // potrebbe essere necessario in futuro aggiungere, all'interno del this.model della colonna in esame,
        // l'alias della tabella che viene utilizzato.
        // Potrebbe infatti essere necessario recuperare l'alias ad esempio in fase di sviluppo della where della query su campi dell'objectLink (applyFilter)
        //this.model.columns[key].tableAlias = joinedTableAlias;
        let r = field.getSelection();

        this.relateds = {
            ...this.relateds || {},
            [field.name]: field
        };

        // la select non viene fatta qui, ma solo alla fine se non sono state dichiarate altre select
        // this.qb.select(`${joinedTableAlias}.${joinTableLabel} as ${joinedFieldsAlias}.${joinTableLabel}`);
        this.qb.leftOuterJoin(`${joinTable} as ${r.joinedTableAlias}`, `${tableName}.${field.sqlSource}`, `${r.joinedTableAlias}.${r.joinTableId}`);
        
        return this;
    }

    where(conditions) {
        if (!conditions){
            return this;
        }
        let builtCondition = this.buildCondition(conditions);

        this.builtCondition = [... (this.builtCondition||[]), ...builtCondition];

        return this;
    }

    applyWhereCondition(builtCondition) {

        if (builtCondition instanceof FieldConditionDef) {

            builtCondition.apply( this );

            this.qb.where(
                builtCondition.sqlField(this),
                builtCondition.type,
                typeof builtCondition.value === 'object' && builtCondition.value instanceof Field ?
                    this.knex.raw(builtCondition.sqlValue(this)) :
                    builtCondition.sqlValue(this)
            );
        }

        else {
            this.qb.where(builtCondition);
        }

        return this;
    }

    andWhere(conditions) {
        if (!conditions)
            return this;

        let builtCondition = this.buildCondition(conditions);

        if (builtCondition instanceof FieldConditionDef) {
            this.qb.andWhere(
                builtCondition.sqlField(this),
                builtCondition.type,
                builtCondition.sqlValue(this)
            );
        }

        else {
            this.qb.andWhere(builtCondition);
        }

        return this;
    }

    buildCondition(conditions) {

        if (!conditions)
            return false;

        if (Array.isArray(conditions)) {
            
            return conditions.map(c => (this.buildCondition(c)));
        }

        if (typeof conditions === 'function') {
            return this.buildCondition(conditions(this));
        }
        else if (typeof conditions === 'object') {
            if (conditions instanceof FieldConditionDef) {
                return conditions;
            }

            // maps field name to field sources
            return Object.fromEntries(
                Object.entries(conditions)
                    .map(([fieldName, value]) => {
                        let field = this.model.fields[fieldName];

                        return [field.sqlSource, value];
                    })
            );
        }

        return conditions;
    }

    select(column) {
        if ( !column ) {
            return this;
        }

        if (Array.isArray(column)) {
            // column.forEach(c => (this.select(c)));

            this.columns = [...this.columns || [], ...column];
            return this;
        }

        this.columns = [...this.columns || [], column];

        return this;
    }

    buildSelect() {
        let field;

        if( !this.qb )
        {
            this.fetch();
        }

        if (typeof column === 'string') {
            field = this.model.fields[column];
            if (!field)
                throw new Error(`Unknown field '${column}' in entity '${this.model.name}'.`);

            let tableName = this.tableAlias || this.model.dbTableName || this.model.name;
            this.qb.select(`${tableName}.${field.sqlSource}`);

        }

        if (typeof column === 'object' && column instanceof FieldAggregation) {
            column.toQuery(this);
            field = column.field;
            return this;
        }

        if (field instanceof ObjectLink) {
            this.selectRelatedDetails(field);
        }

        return this;
    }

    selectAllRelated() {
        if (!this.relateds)
            return;

        Object.entries(this.relateds).forEach(([, field]) => {
            this.columns = [...this.columns || [], field];
            this.selectRelatedDetails(field);
        });
    }

    selectRelatedDetails(field) {
        let r = field.getSelection();
        this.qb.select(`${r.joinedTableAlias}.${r.joinTableLabel} as ${r.joinedFieldsAlias}.${r.joinTableLabel}`);
        this.joinRelated(field);
    }

    groupBy(column) {
        if ( !column ) {
            return this;
        }

        if (Array.isArray(column)) {
            column.forEach(c => (this.groupBy(c)));
            return this;
        }

        let field;

        if (typeof column === 'string') {
            field = this.model.fields[column];
            if (!field)
                throw new Error(`Unknown field '${column}' in entity '${this.model.name}'.`);

            let tableName = this.tableAlias || this.model.dbTableName || this.model.name;
            // la groupBy non fa anche la select /*.select( field.source )*/
            this.qb.groupBy(`${tableName}.${field.sqlSource}`);
        }

        if (field instanceof ObjectLink) {
            let r = field.getSelection();
            this.qb.groupBy(`${r.joinedTableAlias}.${r.joinTableLabel}`);
            this.joinRelated(field);
        }

        this.groups = [...this.groups || [], field];

        return this;
    }

    orderBy(order) {
        // il secondo parametro della orderBy è l'ordinamento di default...sarebbe da inserire nel model
        // let order = utils.orderBy(this.req.query, "id");
        this.qb.orderBy(order.field, order.order);

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
            let joinTable = 'ver_componente_progetto';
            let r = {
                joinedTableAlias: 'ver_componente_progetto',
                sourceField: 'id',
                joinTableId: 'id_componente'
            }
            this.qb.join(`${joinTable} as ${r.joinedTableAlias}`, 
                `${tableName}.${r.sourceField}`, 
                `${r.joinedTableAlias}.${r.joinTableId}`);
        
        }

        return this;
    }

    then(callback) {

        let countAllMode = false;


        this.builtCondition?.forEach( (bc) => {
            this.applyWhereCondition(bc);
        });

        if (!this.columns) {
            let tableName = this.tableAlias || this.model.dbTableName || this.model.name;
            this.qb.select(`${tableName}.*`);
            this.selectAllRelated();
        }
        else {
            // checks for count( * )
            if ( this.columns.find( (c) => ( c instanceof FieldAggregationCount ) ) ) {

                countAllMode = true;

                //return 
                this.qb.count();
                
                /*.then(result => {
                    // ottenuto il risultato primario, esegue le query dipendenti
                    // TODO: Promise.all( Object.entries( this.relatedQuery ).map( ... ) )
                    return result.map((rec) => (this.readRecord(rec)));
                })
                .then(callback);
                */
            }
            else {

            }
        }

        let limit = 50;
        let page= 1;
        this.qb.limit(50).offset(0);
        // this.qb.fetchPage({
        //     pageSize: limit, // Defaults to 10 if not specified
        //     page: page, // Defaults to 1 if not specified
        //     // withRelated: ["Vendor", "Categoria"] // Passed to Model#fetchAll
        //   })

        return this.qb.then(result => {
            // ottenuto il risultato primario, esegue le query dipendenti
            // TODO: Promise.all( Object.entries( this.relatedQuery ).map( ... ) )
            return result.map((rec) => (this.readRecord(rec)));
        })
            .then(callback);
    }

    debug() {
        this.qb.debug();

        return this;
    }
}

exports.KdbQuery = KdbQuery;
