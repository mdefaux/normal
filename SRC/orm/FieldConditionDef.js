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
                throw new Error( `Column '${this.columnName}' not present in query/entity '${query.entity.metaData.name}'.`)
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
        
        if(reqValue === 'null') this.value = null;

        if(Array.isArray(reqValue)) {
            let newReqValue = reqValue.map(e=> {
                if(e === 'null') return null;
                return e;
            });
            this.value = newReqValue;
        }
        
        if(this.type === 'in') return this.in(this.value);

        if(this.type === 'not in') return this.notIn(this.value);

        return this;
    }

    in(arrayOrFunction) {
/*         if (Array.isArray(arrayOrFunction)) {
            if (arrayOrFunction.length > 0 && typeof arrayOrFunction[0] === 'object') {
                arrayOrFunction = arrayOrFunction.map((o) => (this.processValue(o)));
            }
        }

        this.type = 'in';
        this.value = arrayOrFunction;
        return this; */
        return this.handleInclusion(arrayOrFunction, 'in');
    }

    notIn(arrayOrFunction) {
/*         if (Array.isArray(arrayOrFunction)) {
            if (arrayOrFunction.length > 0 && typeof arrayOrFunction[0] === 'object') {
                arrayOrFunction = arrayOrFunction.map((o) => (this.processValue(o)));
            }
        }

        this.type = 'not in';
        this.value = arrayOrFunction;
        return this; */
        return this.handleInclusion(arrayOrFunction, 'not in');
    }

    handleInclusion(arrayOrFunction, operator) {

        // handle null value directly?
        // ...


        // handle array
        let nullValue = null;

        if (Array.isArray(arrayOrFunction)) {
            nullValue = arrayOrFunction.indexOf(null) >= 0;

            if(nullValue) arrayOrFunction.splice(arrayOrFunction.indexOf(null), 1);

            if (arrayOrFunction.length > 0 && typeof arrayOrFunction[0] === 'object') {
                arrayOrFunction = arrayOrFunction.map((o) => (this.processValue(o)));
            }
        }

        if(operator === 'in' || operator === 'not in') this.type = operator;
        this.value = arrayOrFunction;

        if(nullValue && operator === 'in') {
            // this.or. <field>.isNull() ?
            // will chain condition so better return now
            return this.or[this.columnName].isNull();
        }
        if(nullValue && operator === 'not in') {
            // this
            // will chain condition so better return now
            return this.and[this.columnName].isNotNull();

        }

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
       let otherDef = new IsNullFieldConditionDef("is null", this.field, undefined);
       otherDef.columnName = this.columnName;
       otherDef.chainedCondition = this.chainedCondition;
       return otherDef;
    }
    

    isNotNull() {
        let otherDef = new IsNotNullFieldConditionDef("is not null", this.field, undefined);
        otherDef.columnName = this.columnName;
        otherDef.chainedCondition = this.chainedCondition;
        return otherDef;
    }

    get or() {

        // creates another generic condition def
        let chained = this.createChained();
        // chains the new condition with this one
        chained.chainedCondition = {
            op: 'or',           // chain operator: or
            next: this
        }
        // returns a proxy of the new generic condition
        return chained.createProxy();
    }

    get and() {

        let chained = this.createChained();
        chained.chainedCondition = {
            op: 'and', next: this
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
