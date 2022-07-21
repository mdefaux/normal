const { Query } = require("./Query");
// const { Field } = require("./Model");
const assert = require('assert');


class FieldQueryItem {

    constructor ( field ) {
        this.field = field;
        this.name = field.name;
        // c.toEntityName = this.toEntityName;
        // c.factory = this.factory;
        // c.tableModel = this.tableModel;
        this.sourceField = field.sourceField;
    }

    get sqlSource() {
        if (this.sourceAlias) {
            return `${this.sourceAlias}.${this.sourceField || this.name}`;
        }
        return this.sourceField || this.name;
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


class FieldConditionDef {

    constructor(type, field, value, tableAlias, query) {
        this.type = type;
        this.field = field;
        this.value = value;
        this.tableAlias = tableAlias;
        this.query = query;
    }

    apply ( query ) {

        if ( !this.field ) {

            this.field = query[ this.columnName ];
        }
    }

    sqlField(query) {
        // if( query?.tableAlias || this.tableAlias )
        //     return `${query?.tableAlias || this.tableAlias}.${this.field.sqlSource}`;
        return `${this.field.sqlSource}`;

    }

    sqlValue(query) {
        if (typeof this.value === 'object') {
            if (this.value instanceof Query) {
                return this.value.qb;
            }
            // else if (this.value instanceof Field) {
            else if (this.value && this.value.sqlSource) {
                return this.value.sqlSource;
            }
        }
        return this.value;
    }

    toQuery(query) {
        return `${this.tableAlias}.${this.field.sqlSource} in `;
    }
    

    parseQueryString( reqField, reqValue ) {
        this.columnName= reqField.substring(1);

        assert( Array.isArray( reqValue ) );
        this.value= reqValue;
        return this;
    }
}

exports.FieldConditionDef = FieldConditionDef;
exports.FieldQueryItem = FieldQueryItem;
