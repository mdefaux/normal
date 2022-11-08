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
    

    processValue(obj) {
        return obj[this.name];
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

    isNull() {
        return new IsNullFieldConditionDef("is null", this, objectOrFunction);
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

    createChained() {
        let chained = new FieldConditionDef();
        chained.tableAlias = this.tableAlias;
        chained.query = this.query;
        return chained;
    }

    apply ( query ) {

        if ( !this.field ) {

            if ( !this.columnName ) {
                throw new Error( `Column not specified for condition '${this.type}'.`)
            }

            this.field = query[ this.columnName ];
            if ( !this.field ) {
                throw new Error( `Column '${this.columnName}' not present in query/entity '${query.name || query.entity.name}'.`)
            }
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
                this.value.build();
                // console.log( this.value.qb )
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
    

    setup( reqField, reqValue ) {
        this.columnName= reqField;
        this.value= reqValue;
        return this;
    }

    in(arrayOrFunction) {
        if (Array.isArray(arrayOrFunction)) {
            if (arrayOrFunction.length > 0 && typeof arrayOrFunction[0] === 'object') {
                arrayOrFunction = arrayOrFunction.map((o) => (this.processValue(o)));
            }
        }

        this.type = 'in';
        this.value = arrayOrFunction;
        return this;
    }

    notIn(arrayOrFunction) {
        if (Array.isArray(arrayOrFunction)) {
            if (arrayOrFunction.length > 0 && typeof arrayOrFunction[0] === 'object') {
                arrayOrFunction = arrayOrFunction.map((o) => (this.processValue(o)));
            }
        }

        this.type = 'not in';
        this.value = arrayOrFunction;
        return this;
    }

    equals(objectOrFunction) {
        // return new FieldConditionDef("=", this, objectOrFunction);
        this.type = '=';
        this.value = objectOrFunction;
        return this;
    }

    greaterThan(objectOrFunction) {
        // return new FieldConditionDef(">", this, objectOrFunction);
        this.type = '>';
        this.value = objectOrFunction;
        return this;
    }

    isNull() {
        // TODO: implement
        assert ( false );
        return new IsNullFieldConditionDef("is null", this, undefined);
    }
    

    isNotNull() {
        // TODO: implement
        assert ( false );
        return new IsNotNullFieldConditionDef("is not null", this, undefined);
    }

    get or() {

        let chained = this.createChained();
        chained.chainedCondition = {
            op: 'or', next: this
        }
        return chained.createProxy();
    }

    createProxy() {

        return new Proxy( this, {
            get ( target, prop, receiver ) {

                if ( target.model?.fields[ prop ] ) {
                    target.field = target.model?.fields[ prop ];
                }
                else {
                    target.columnName = prop;
                }

                return target;
            }

        })
    }
}


class IsNullFieldConditionDef extends FieldConditionDef {

    constructor(type, field, value, tableAlias, query) {
        super( type, field, value, tableAlias, query );
    }


    toQuery(query) {
        return `${this.tableAlias}.${this.field.sqlSource} is null `;
    }

}

class IsNotNullFieldConditionDef extends FieldConditionDef {

    constructor(type, field, value, tableAlias, query) {
        super( type, field, value, tableAlias, query );
    }


    toQuery(query) {
        return `${this.tableAlias}.${this.field.sqlSource} is not null `;
    }

}

exports.FieldConditionDef = FieldConditionDef;
exports.FieldQueryItem = FieldQueryItem;
exports.IsNullFieldConditionDef = IsNullFieldConditionDef;
exports.IsNotNullFieldConditionDef = IsNotNullFieldConditionDef;
