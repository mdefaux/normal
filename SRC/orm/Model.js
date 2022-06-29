const { FieldAggregationMax } = require("./FieldAggregation");
const { FieldConditionDef } = require("./FieldConditionDef");

class Model {
    constructor(name) {
        this.name = name;
        this.fields = {};
    }
}

class Field {
    constructor(name) {
        this.name = name;
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
        // c.modelFields = this.modelFields;
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

    max() {
        return new FieldAggregationMax(this);
    }

}

class PrimaryKeyField extends Field {
    constructor(name) {
        super(name);
    }
}

class Relation extends Field {
    constructor(name, factory, modelFields) {
        super(name);
        this.factory = factory;
        this.modelFields = modelFields;
        this.toEntityName = name;
    }

    toEntity(sourceName) {
        this.toEntityName = sourceName;
        return this;
    }

}

class ObjectLink extends Relation {
    constructor(name, factory, modelFields) {
        super(name, factory, modelFields);
        this.sourceField = name;
    }

    copy() {
        let c = new ObjectLink();
        c.name = this.name;
        c.toEntityName = this.toEntityName;
        c.factory = this.factory;
        c.modelFields = this.modelFields;
        c.sourceField = this.sourceField;
        return c;
    }

    source(sourceName) {
        this.sourceField = sourceName;
        return this;
    }

    rename(name) {
        this.name = name;
        return this;
    }

    getSelection() {
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

    processValue(obj) {
        let entity = this.factory[this.toEntityName];
        return obj[entity.model.idField];
    }
}

class RelatedObjects extends Relation {
    constructor(name, factory, modelFields) {
        super(name, factory, modelFields);
        this.rename = name;
    }

    foreignField(sourceName) {
        this.field = sourceName;
        return this;
    }
}

class PartsOf extends RelatedObjects {
    constructor(name, factory, modelFields) {
        super(name, factory, modelFields);
        this.rename = name;
        this.toEntityName = name;
        this.sourceField = name;
    }

    source(sourceName) {
        this.sourceField = sourceName;
        return this;
    }

    toEntity(sourceName) {
        this.toEntityName = sourceName;
        return this;
    }

}

exports.Model = Model;
exports.Field = Field;
exports.PrimaryKeyField = PrimaryKeyField;
exports.RelatedObjects = RelatedObjects;
exports.ObjectLink = ObjectLink;
exports.PartsOf = PartsOf;
