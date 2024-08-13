
class Action {

    constructor( name, entity, callback ) {
        this.name = name;
        this.entity = entity;
        this.callback = callback;
    }

    async execute( data ) {

        return this.callback( data );
    }
}

exports.Action = Action;