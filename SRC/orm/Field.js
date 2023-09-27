/**Fields models are parts of Entity.
 * There is a field class for each type of data such as strings, 
 * numbers, date or ObjectLinks.
 * ObjectLinks are particular type which value is present to another 
 * linked Entity, like data base foreign key.
 * 
 * 
 */
const { FieldAggregationMax } = require("./FieldAggregation");
const { FieldConditionDef, IsNullFieldConditionDef, IsNotNullFieldConditionDef, FieldQueryItem } = require("./FieldConditionDef");


/**Model of a Field
 * Base class for all field types.
 */
class Field {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        if ( name ) {
            this.label = name?.toUpperCase();
        }
    }

    // TODO: checks if used and alter entity model
    rename(name) {
        this.name = name;
    }

    get sqlSource() {
        if (this.sourceAlias) {
            return `${this.sourceAlias}.${this.sourceField || this.name}`;
        }
        return this.sourceField || this.name;
    }

    processValue(obj) {
        return obj[this.name];
    }

    copy() {
        // let c = new Field();
        let c = new FieldQueryItem( this );
        c.name = this.name;
        // c.toEntityName = this.toEntityName;
        // c.factory = this.factory;
        // c.tableModel = this.tableModel;
        c.sourceField = this.sourceField;
        return c;

    }

    in(arrayOrFunction) {
        // if (Array.isArray(arrayOrFunction)) {
        //     if (arrayOrFunction.length > 0 && typeof arrayOrFunction[0] === 'object') {
        //         arrayOrFunction = arrayOrFunction.map((o) => (this.processValue(o)));
        //     }
        // }

        // return new FieldConditionDef("in", this, arrayOrFunction);
        return new FieldConditionDef(undefined, this).in( arrayOrFunction );
    }

    notIn(arrayOrFunction) {
        return new FieldConditionDef(undefined, this).notIn( arrayOrFunction );
    }

    equals(objectOrFunction) {
        return new FieldConditionDef("=", this, objectOrFunction);
    }

    like(objectOrFunction) {
        return new FieldConditionDef("like", this, objectOrFunction);
    }

    notEquals(objectOrFunction) {
        return new FieldConditionDef("<>", this, objectOrFunction);
    }

    lessThan(objectOrFunction) {
        return new FieldConditionDef("<", this, objectOrFunction);
    }

    lessOrEqualThan(objectOrFunction) {
        return new FieldConditionDef("<=", this, objectOrFunction);
    }

    greaterThan(objectOrFunction) {
        return new FieldConditionDef(">", this, objectOrFunction);
    }

    greaterOrEqualThan(objectOrFunction) {
        return new FieldConditionDef(">=", this, objectOrFunction);
    }

    isNull() {
        return new IsNullFieldConditionDef("is null", this, undefined);
    }
    

    isNotNull() {
        return new IsNotNullFieldConditionDef("is not null", this, undefined);
    }

    max() {
        return new FieldAggregationMax(this);
    }

    serialize() {

        return {
            name: this.name,
            type:  this.type,
            ...this.label !== undefined && {label: this.label},
            // disabled if we don't want that FE knows about db source name
            // ...this.sourceField !== undefined && {sourceField: this.sourceField},
            ...this.visibile !== undefined && {visible: this.visible},
            ...this.defaultColumnWidth !== undefined && {defaultColumnWidth: this.defaultColumnWidth},
        }
    }

    toRaw( value ) {
        return [ this.sqlSource, value ];
    }

    parseValue( value ) {
        return value;
    }

    equalValues( valueA, valueB ) {
        return this.parseValue( valueA ) === this.parseValue( valueB );
    }

    compareValues( valueA, valueB ) {
        if ( this.equalsValue( valueA, valueB ) ) {
            return 0;
        }
        if ( this.parseValue( valueA ) < this.parseValue( valueB ) ) {
            return -1;
        }
        // if ( this.parseValue( valueA ) > this.parseValue( valueB ) ) {
        return 1;
    }
}

class PrimaryKeyField extends Field
{
    constructor(name)
    {
        super(name,"integer");  // TODO: change integer ???
    }
}
/*
 *
 */
class StringField extends Field
{
    constructor(name)
    {
        super(name, "string");
    }
}
class DateField extends Field
{
    constructor(name)
    {
        super(name, "Date");
    }

    parseValue( value ) {
        if(value === null) return null;
        if( !value ) return null;

        let dt = null;
        if( typeof value === 'string' )
        {
            let dtm;
            if( dtm = value.match( /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/ ) )
            {
                return new Date( dtm[3], dtm[2]-1, dtm[1] );
            }
            else if( dtm = value.match( /^(\d{1,2})[\/\-\.](\d{1,2})/ ) )
            {
                return new Date( new Date().getFullYear(), 
                    dtm[2]-1, dtm[1] );
            }
            else if( dtm = value.match( /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/ ) )
            {
                return new Date( dtm[1], dtm[2]-1, dtm[3] );
            }
            return null;
        }
        dt = new Date(value);

        if( !this.timeEnabled )
        {
            dt.setHours(0,0,0,0);
        }

        return dt;
    
    }

    equalValues( valueA, valueB ) {
        return this.parseValue( valueA )?.getTime() === this.parseValue( valueB )?.getTime();
    }

}
class NumberField extends Field
{
    constructor(name)
    {
        super(name, "number");
    }

    parseValue( value ) {
        // nully value are valid (null, undefined)
        if ( value === null || value === undefined ) {
            return null;
        }
        if ( isNaN(value) ) {
            throw new Error( `Value '${value}' is not a valid number for field '${this.name}'.`)
        }
        
        return parseFloat(parseFloat(value).toFixed(2));
    }

    equalValues( valueA, valueB ) {
        return this.parseValue( valueA ) === this.parseValue( valueB );
    }
}
class IntegerField extends Field
{
    constructor(name)
    {
        super(name, "integer");
    }

    parseValue( value ) {
        // nully value are valid (null, undefined)
        if ( value === null || value === undefined ) {
            return null;
        }
        if ( isNaN(value) ) {
            throw new Error( `Value '${value}' is not an integer for field '${this.name}'.`)
        }
        return parseInt(value);
    }

    equalValues( valueA, valueB ) {
        return this.parseValue( valueA ) === this.parseValue( valueB );
    }
}
class BooleanField extends Field
{
    constructor(name)
    {
        super(name, "boolean");
    }

    parseValue( value ) {
        
        if(value === 1 || value === '1' || value === 'true' || value === true || value === "Si" || value === "Y" || value === "S" || value === "T"  ) return true;

        return false;
    
    }

    equalValues( valueA, valueB ) {
        return this.parseValue( valueA ) === this.parseValue( valueB );
    }
}


/*
 * RELATIONS
 */

/**
 * 
 */
class Relation extends Field {

    constructor(name, factory, tableModel, type) {
        super(name,type);
        this.factory = factory;
        this.tableModel = tableModel;
        this.toEntityName = name;
    }

    toEntity(sourceName) {
        this.toEntityName = sourceName;
        return this;
    }


    serialize() {

        return {
            name: this.name,
            type:  this.type,
            // ...this.label !== undefined && {label: this.label},
            // disabled if we don't want that FE knows about db source name
            // ...this.sourceField !== undefined && {sourceField: this.sourceField},
            // ...this.visibile !== undefined && {visible: this.visible},
            // ...this.defaultColumnWidth !== undefined && {defaultColumnWidth: this.defaultColumnWidth},
        }
    }
}

class ObjectLinkRelation extends Relation {

    constructor(name, factory, tableModel, field) {
        super(name, factory, tableModel, "ObjectLink");
        this.field = field;
    }

    serialize() {

        return {
            name: this.name,
            type:  this.type,
            // disabled if we don't want that FE knows about db source name
            // ...this.field.sourceField !== undefined && {column: this.field.sourceField},
        }
    }
}

class ObjectLink extends Relation {

    constructor(name, factory, tableModel) {
        super(name, factory, tableModel, "ObjectLink");
        this.sourceField = name;

        tableModel.relations[ name ] = new ObjectLinkRelation( name, factory, tableModel, this );
        tableModel.relations[ name ].field = this;
    }

    copy() {
        let c = new FieldQueryItem ( this );
        c.name = this.name;
        c.toEntityName = this.toEntityName;
        c.factory = this.factory;
        c.tableModel = this.tableModel;
        c.sourceField = this.sourceField;
        return c;
    }

    source(sourceName)
    {
        this.sourceField = sourceName;
        return this;
    }

    rename(name)
    {
        this.name = name;
        return this;
    }

    getSelection() {
        // let joinField = this.sourceField;
        let foreignTableName = this.factory[this.toEntityName].metaData.model.dbTableName;
        let foreignLabelName = this.factory[this.toEntityName].metaData.model.labelField;
        let foreignLabelField = this.factory[this.toEntityName].metaData.model.fields[ foreignLabelName ];
        if (!foreignLabelName) {
            throw new Error (`NORMALY-0003 Table '${this.toEntityName}' missing label definition.` );
        }
        if (!foreignLabelField) {
            throw new Error (`NORMALY-0004 Table '${this.toEntityName}' wrong label definition, column with name '${foreignLabelName}'  dosen't exist.` );
        }
        let foreignTableLabel = foreignLabelField.sqlSource;
        let foreignId = this.factory[this.toEntityName].model.idField;
        let foreignFieldsAlias = `_c_${this.name}`; // this.getAliasFieldName(this.name);
        let foreignTableAlias = `_jt_${foreignTableName.toUpperCase()}_${this.name}`;

        // potrebbe essere necessario in futuro aggiungere, all'interno del this.model della colonna in esame,
        // l'alias della tabella che viene utilizzato.
        // Potrebbe infatti essere necessario recuperare l'alias ad esempio in fase di sviluppo della where della query su campi dell'objectLink (applyFilter)
        //this.model.columns[key].tableAlias = foreignTableAlias;
        return {
            foreignTableAlias: foreignTableAlias,
            foreignId: foreignId,
            foreignTableLabel: foreignTableLabel,
            foreignFieldsAlias: foreignFieldsAlias,
            foreignLabelName: foreignLabelName,
            field: this,
            entity: this.factory[this.toEntityName]
        };

    }

    processValue(obj)
    {
        // let entity = this.factory[this.toEntityName];
        return obj[this.toModel.idField];
    }
    
    get toEntity() {
        return this.factory[this.toEntityName];
    }
    
    get toModel() {
        let entity = this.factory[this.toEntityName];
        return entity.metaData.model;
    }

    serialize() {

        return {
            ...super.serialize(),
            table: this.toEntityName,
            // to disable if we don't want that FE knows about db source name
            // ...this.sourceField !== undefined && {sourceField: this.sourceField},
        }
    }
    
    parseValue( value ) {
        let idField = this.toModel.idField;
        if ( !value || value[idField] === null ) {
            return null;
        }
        // TODO: check id field
        if ( value[idField] !== undefined ) {
            // TODO: use the 'id' name
            return {...value, [idField]: parseInt( value[idField] )};
        }
        else if (typeof value === 'string' && isNaN( value ) ) {
            return value;
        }
        else {
            if ( isNaN(value) ) {
                throw new Error( `Value '${value}' is not a valid id for field '${this.name}'.`)
            }
            // assert( parseInt( value ) !== 'NaN');
            return parseInt( value );
        }
    }

    toRaw( value, statement ) {

        let idField = this.toModel.idField;
        // TODO: check if value is an object
        if ( value?.[idField] !== undefined ) {
            // TODO: use the 'id' name
            return [ this.sqlSource, value[idField] ];
        }
        else if (typeof value === 'string' && isNaN( value ) ) {
            return [ this.sqlSource, async (cache)=>{
                if ( cache && cache[ value ] ) {
                    return cache[ value ];
                }
                let entity = this.factory[ this.toEntityName ];
                let result = await entity
                    .select( [entity[idField]] )
                    .byLabel( value );
                if(!result){
                    // throws exception is auto insert is not enabled
                    if ( false && ! statement?.autoInsertNewObjectLookupValues ) {
                        throw new Error (`NORMALY-0002 Value: '${value}' for column '${this.name}' not found in table '${this.toModel.name}'.` );
                    }
                    // inserts new value in loked table
                    result = await this.toEntity.insert( { [this.toModel.labelField]: value } )
                }
                if ( cache ) {
                    cache[ value ] = result[idField];
                }
                return result[idField];
            } ];
        }
        else {
            return [ this.sqlSource, value ];
        }
    }
}

/**TODO:
 * 
 */
class RelatedObjects extends Relation
{
    constructor(name, factory, tableModel)
    {
        super(name, factory, tableModel);
        this.rename = name;
    }

    foreignField(sourceName)
    {
        this.field = sourceName;
        return this;
    }
}

/**TODO:
 * 
 */
class PartsOf extends RelatedObjects
{
    constructor(name, factory, tableModel)
    {
        super(name, factory, tableModel);
        this.rename = name;
        this.toEntityName = name;
        this.sourceField = name;
    }

    source(sourceName)
    {
        this.sourceField = sourceName;
        return this;
    }

    toEntity(sourceName)
    {
        this.toEntityName = sourceName;
        return this;
    }

}

module.exports = {
    Field: Field,
    PrimaryKeyField: PrimaryKeyField,
    StringField: StringField,
    DateField: DateField,
    NumberField: NumberField,
    IntegerField: IntegerField,
    BooleanField: BooleanField,
    RelatedObjects: RelatedObjects,
    ObjectLink: ObjectLink,
    PartsOf: PartsOf,
}