
const srcBase = '/api/ORM';

class Model {
    constructor(name) {
        this.name = name;
        this.fields = {};
        this.relations = {};
        this.paged = true;
    }

    serialize() {

        return {
            table: this.name,
            paged: !!this.paged,
            columns: Object.fromEntries(
                Object.entries(this.fields).map(([name, field]) => (
                    [name, field.serialize()]
                ))
            ),
            relations: Object.fromEntries(
                Object.entries(this.relations).map(([name, relation]) => (
                    [name, relation.serialize()]
                ))
            ),
            version: 2,
            src: `${srcBase}/${this.name}`,
            idField: this.idField,
            labelField: this.labelField
        }
    }
}

exports.Model = Model;
