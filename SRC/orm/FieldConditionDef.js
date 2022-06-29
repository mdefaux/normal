const { Query } = require("./Query");
// const { Field } = require("./Model");

class FieldConditionDef {

    constructor(type, field, value, tableAlias, query) {
        this.type = type;
        this.field = field;
        this.value = value;
        this.tableAlias = tableAlias;
        this.query = query;
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
}
exports.FieldConditionDef = FieldConditionDef;
