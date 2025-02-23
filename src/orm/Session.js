

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
            // throw new Error( `Unknown entity '${entityName}'.`);
            throw new Error( `Unknown entity.`);
        }

        const entity = this.store.entities[entityName];
        const session = this;

        // return new EntityProxy( entity, this.data );
        return new Proxy( entity, {
            get(target, name, receiver) {

                if (name === 'update') {
                    if (typeof entity.metaData.canUpdate === 'function') {
                        if (!entity.metaData.canUpdate(session)) {
                            throw new Error(`Cannot update entity '${entity.metaData.name}'.`)
                        }
                    } else if (typeof entity.metaData.canChange === 'function') {
                        if (!entity.metaData.canChange(session)) {
                            throw new Error(`Cannot update entity '${entity.metaData.name}'.`)
                        }
                    }
                }
                if (name === 'insert') {
                    if (typeof entity.metaData.canInsert === 'function') {
                        if (!entity.metaData.canInsert(session)) {
                            throw new Error(`Cannot insert entity '${entity.metaData.name}'.`)
                        }
                    } else if (typeof entity.metaData.canChange === 'function') {
                        if (!entity.metaData.canChange(session)) {
                            throw new Error(`Cannot insert entity '${entity.metaData.name}'.`)
                        }
                    }
                }
                if (name === 'delete') {
                    if (typeof entity.metaData.canDelete === 'function') {
                        if (!entity.metaData.canDelete(session)) {
                            throw new Error(`Cannot delete entity '${entity.metaData.name}'.`)
                        }
                    } else if (typeof entity.metaData.canChange === 'function') {
                        if (!entity.metaData.canChange(session)) {
                            throw new Error(`Cannot delete entity '${entity.metaData.name}'.`)
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
