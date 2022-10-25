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
        if (Array.isArray(arrayOrFunction)) {
            if (arrayOrFunction.length > 0 && typeof arrayOrFunction[0] === 'object') {
                arrayOrFunction = arrayOrFunction.map((o) => (this.processValue(o)));
            }
        }

        return new FieldConditionDef("in", this, arrayOrFunction);
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
}
class NumberField extends Field
{
    constructor(name)
    {
        super(name, "number");
    }
}
class IntegerField extends Field
{
    constructor(name)
    {
        super(name, "integer");
    }
}
class BooleanField extends Field
{
    constructor(name)
    {
        super(name, "boolean");
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
        let joinTable = this.factory[this.toEntityName].model.dbTableName;
        let joinTableLabel = this.factory[this.toEntityName].model.labelField;
        let joinTableId = this.factory[this.toEntityName].model.idField;
        let joinedFieldsAlias = `_c_${this.name}`; // this.getAliasFieldName(this.name);
        let joinedTableAlias = `_jt_${joinTable}`;

        // potrebbe essere necessario in futuro aggiungere, all'interno del this.model della colonna in esame,
        // l'alias della tabella che viene utilizzato.
        // Potrebbe infatti essere necessario recuperare l'alias ad esempio in fase di sviluppo della where della query su campi dell'objectLink (applyFilter)
        //this.model.columns[key].tableAlias = joinedTableAlias;
        return {
            joinedTableAlias: joinedTableAlias,
            joinTableId: joinTableId,
            joinTableLabel: joinTableLabel,
            joinedFieldsAlias: joinedFieldsAlias,
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

        if ( value?.id !== undefined ) {
            return [ this.sqlSource, value.id ];
        }
        else {
            return [ this.sqlSource, value ];
        }
    }
}
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