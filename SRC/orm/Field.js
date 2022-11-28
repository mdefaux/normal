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
        let c = new Field();
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

    greaterThan(objectOrFunction) {
        return new FieldConditionDef(">", this, objectOrFunction);
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
            ...this.sourceField !== undefined && {sourceField: this.sourceField},
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

    getSelection()
    {
        // let joinField = this.sourceField;
        let foreignTableName = this.factory[this.toEntityName].metaData.model.dbTableName;
        let foreignLabelName = this.factory[this.toEntityName].metaData.model.labelField;
        let foreignLabelField = this.factory[this.toEntityName].metaData.model.fields[ foreignLabelName ];
        let foreignTableLabel = foreignLabelField.sqlSource;
        let foreignId = this.factory[this.toEntityName].model.idField;
        let foreignFieldsAlias = `_c_${this.name}`; // this.getAliasFieldName(this.name);
        let foreignTableAlias = `_jt_${foreignTableName}`;

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
        let entity = this.factory[this.toEntityName];
        return obj[entity.model.idField];
    }
    

    serialize() {

        return {
            ...super.serialize(),
            table: this.toEntityName,
            // to disable if we don't want that FE knows about db source name
            ...this.sourceField !== undefined && {sourceField: this.sourceField},
        }
    }
    

    toRaw( value ) {

        // TODO: check if value is an object
        if ( value?.id !== undefined ) {
            // TODO: use the 'id' name
            return [ this.sqlSource, value.id ];
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