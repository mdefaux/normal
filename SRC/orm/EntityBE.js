
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
        this.host = host
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

    query() {
        // TODO: host should create/factory for query 
        // TODO: use storage query if entity is marked 'local storage'
        if ( this.storage ) {
            return this.storage.createQuery( this );
        }
        // return new KdbQuery(this);
        return this.host.createQuery( this );
    }

    fetch() {
        return this.query().fetch();
    }

    fetchWithRelated() {
        return this.query().fetchWithRelated();
    }

    select(field) {
        return this.fetch().select(field);
    }
    
    /**Gets a record
     * 
     * @param {*} id 
     * @returns 
     */
    async getRecord( id ) {
        return this.host.createQuery( this )
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
        delete record[ this.model.idField ];

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
}

exports.EntityBE = EntityBE;
