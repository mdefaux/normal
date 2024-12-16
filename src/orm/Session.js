

class EntityProxy {

    constructor( entity, session ) {
        this.entity = entity;
        this.session = session;
    }

    select( ...args ) {
        return this.entity.select( ...args );
    }

    update( ...args ) {
        return this.entity.update( ...args );
    }

    insert( ...args ) {
        return this.entity.insert( ...args );
    }

    getRelation( ...args ) {
        return this.entity.getRelation( ...args );
    }
    
    parse( ...args ) {
        return this.entity.parse( ...args );
    }

    getMetaData() {

    }
}


class Session {

    constructor( store, userData ) {
        this.store = store;
        this.data = userData;
    }

    getEntity(entityName) {
        if(!entityName || !this.store.entities[entityName] ) {
            throw new Error( `Unknown entity '${entityName}'.`);
        }

        const entity = this.store.entities[entityName];

        // return new EntityProxy( entity, this.data );
        return new Proxy( entity, {
            get(target, name, receiver) {
    
              if ( name === 'update' ) {
                if ( typeof entity.canUpdate === 'function' ) {
                    if ( !entity.canUpdate( this ) ) {
                        throw new Error( `Cannot update entity '${entityName}'.`)
                    }
                }
              }
    
              let value = Reflect.get(target, name, receiver);
              return value;
            }
        })
    }
}

exports.Session = Session;
