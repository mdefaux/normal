/**Entity defines the structure, the fields (column table) and relations
 * with other entities.
 * 
 */

class EntityBE {
    /**
     *
     * @param {*} name
     * @param {*} model
     * @param {*} factory
     */
    constructor(name, model, factory, host) {
        this.name = name;
        this.model = model;
        this.factory = factory;
        this.host = host;
        this.metaData = {
            name: name,
            model: model,
            columns: [],
            factory: factory,
            host: host,
            relations: {}
        };
    }

    setup() {
        Object.entries(this.model.fields)
            .forEach(([key, field]) => {
                Object.defineProperty(this, field.name, {
                    get: function () {
                        return this.model.fields[field.name];

                        //, this.alias || this.name );
                    }
                });

            });
    }

    statement() {
        // TODO: host should create/factory for query 
        // host.createStatement();
        // return new Query(this, this.model, this.factory);
    }

    saveAll( arrayOfRecords ) {
        if( Array.isArray(arrayOfRecords) )
        {
            throw new Error( `Object '${arrayOfRecords}' is not array.` );
        }
        return Promise.all( 
            arrayOfRecords.map( (r) => ( this.save(r) ) ) 
        );
    }

    createQuery() {
        // TODO: host should create/factory for query 
        // TODO: use storage query if entity is marked 'local storage'
        if ( this.storage ) {
            return this.storage.createQuery( this );
        }
        // return new KdbQuery(this);
        return this.host.createQuery( this );
    }

    createRelationQuery( relatedEntityName ) {

        
        if ( !this.metaData.relations[ relatedEntityName ] ) {
            throw new Error( `'${relatedEntityName}' is not related with entity '${this.name}'.`)
        }
        
        const queryFactory = this.metaData.relations[ relatedEntityName ].queryFactory;
        let relationQuery = queryFactory( this.createQuery() );

        
        
        if ( !relationQuery ) {
            throw new Error( `'${relatedEntityName}' is not related with entity '${this.name}'.`)
        }

        return relationQuery;
    }

    getRelation( relatedEntityName ) {

        
        if ( !this.metaData.relations[ relatedEntityName ] ) {
            throw new Error( `'${relatedEntityName}' is not related with entity '${this.name}'.`)
        }
        
        const queryFactory = this.metaData.relations[ relatedEntityName ];
        
        if ( !queryFactory ) {
            throw new Error( `'${relatedEntityName}' is not related with entity '${this.name}'.`)
        }
        if ( !queryFactory.select ) {
            throw new Error( `Relation '${this.name}' - '${relatedEntityName}' has no selection query.`)
        }
        let relationQuery = queryFactory; // .select();

        if ( !relationQuery ) {
            throw new Error( `Relation '${this.name}' - '${relatedEntityName}' has no selection query.`)
        }

        return relationQuery;
    }

    // fetch() {
    //     return this.createQuery().fetch();
    // }

    // fetchWithRelated() {
    //     return this.createQuery().fetchWithRelated();
    // }

    select(field) {
        return this.createQuery().fetch().select(field);
    }
    
    /**Gets a record
     * 
     * @param {*} id 
     * @returns 
     */
    async getRecord( id ) {

        if ( typeof id === 'object' ) {

            let rr = await this.select()
                .modify( qb => qb.where( id ) )
                .first();
            return rr;
        }

        return this.createQuery( this )
            .fetch()
            .where( (qb) => (qb[ this.model.idField ].equals( id )) )
            // .where( this[ this.model.idField ].equals( newId ) )
            // .where( { [this.model.idField]: newId } )
            .then( (r) => ( r[0] ));
    }

    /**Insert a new record
     * 
     */
    async insert( record ) {
        // saves temporary ids
        let tempId = record._id;
        delete record._id;
        // delete record[ this.model.idField ];

        // creates the insert statement
        let insert = this.host.createInsert( this );
        let newId = await insert.value( record ).exec(); // executes the insert

        // after getting the new id, queries the new record
        let r = await this.getRecord( newId );

        return { ...r, _id: tempId };
    }

    /**Updates a record
     * 
     * @param {*} record 
     * @returns 
     */
    async update( id, record /*, returning */ ) {
      //  let idFilter = record[ this.model.idField ];
        let idFilter = id;
        // creates the update statement
        let update = this.host.createUpdate( this );
        let updateRecord = await update.value(id, record ).exec(/* returning */); // executes the update

        // for now, get the updated record data with a select.
        // if(!returning || returning.length === 0) 
        let r = await this.getRecord( idFilter );
        

        return r;
    }

    /**Updates a record
     * 
     * @param {*} record 
     * @returns 
     */
    async delete( id ) {
        
        // creates the delete statement
        let delStatement = this.host.createDelete( this );

        if ( Array.isArray( id ) ) {
            await delStatement.values( id ).exec(); // executes the delete
        }
        else {
            await delStatement.value( id ).exec(); // executes the delete
        }
    }

    parse( object ) {

        return Object.entries(object).reduce( 
            ( prevValue, [currentKey, currentValue] ) => {

                if ( this.model.fields[ currentKey ] ) {
                    return { ...prevValue, [ currentKey ]: currentValue }
                }
                return prevValue;
            },
        {} );

    }

    /**Saves record wheter is already present in db or not.
     * Tryies to update, if update returns no row, proceed inserting.
     * 
     * @param {*} record 
     * @returns 
     */
    async save( record ) {
        let r;

        // try {
        // tryies to update
        r = false; // await this.update( record );
        
        // 
        if( !r )
            r = await this.insert( record );

        return r;
    }

    
    getModel() {

        return this.model.serialize();
    }

    actions( actionName ) {
        if ( !this.actionDictionary?.[ actionName ] ) {
            throw new Error( `Action '${actionName}' not defined in entity '${this.name}' ` )
        }

        return this.actionDictionary[ actionName ];
    }

    allign( parameters ) {
        
        if ( !parameters.source ) {
            throw new Error( `source parameter is mandatory for allign function` );
        }
        let source = parameters.source;
        let destination = parameters.destination || this.select().pageSize( 500 );

        // TODO: alligment procedure
        // ...
        // 
    }
}

exports.EntityBE = EntityBE;
