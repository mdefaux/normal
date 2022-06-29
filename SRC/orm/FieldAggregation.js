class FieldAggregation {
    constructor(field) {
        this.field = field;
    }
}
// exports.FieldAggregation = FieldAggregation;
class FieldAggregationMax extends FieldAggregation {
    constructor(field) {
        super(field);
    }

    toQuery(query) {
        query.qb.max(this.field.sqlSource);
    }
}

exports.FieldAggregation = FieldAggregation;
exports.FieldAggregationMax = FieldAggregationMax;
