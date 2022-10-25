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
//array.isArray per fare controllo se è un array

        // creates the insert statement
        let insert = this.host.createInsert( this );
        let newId = await insert.value( record ).exec(); // executes the insert
console.log('faccio vedere il nuovo id');
        console.log(newId);
        // after getting the new id, queries the new record
        let r = await this.getRecord( newId );
console.log('vediamo sta R!!');
        console.log(r);
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

  async  allign( parameters ) {
        
        if ( !parameters.source ) {
            throw new Error( `source parameter is mandatory for allign function` );
        }
        let source = parameters.source;
        let destination = parameters.destination || this.select().pageSize( 5);
console.log('sono nella allign');
        // TODO: alligment procedure
        // ...
        // 
        let pageA = 1
        let pageB = 1
        //il primo array è as400
        source.page(pageA);
        let arrayA = await source.exec();
       // console.log(arrayA);
        //il secondo array è locale
        destination.page(5,1);
        let arrayB =   await destination.exec();
      //  console.log(arrayB);
        let arrayI=[];
       // var arrayI = new Array();
        let arrayD=[];
        for (var ia=0,ib=0; ( arrayA.length!==0 || arrayB.length!==0 ); ) 
        {
                if( arrayA.length===ia && arrayI.length<=100 ) {
                    ia = 0
                    pageA ++;
                    source.page(pageA);
                    arrayA = await source.exec();
                  }
                
                if(arrayB.length===ib) {
                    ib = 0
                    pageB ++;
                    destination.page(5,pageB);
                    arrayB =   await destination.exec();

                    
                }
                
                    if(ib >= arrayB.length && ia >= arrayA.length )
                    {
                    //    console.log('break');
                    //    console.log(ii);
                            break ;
                    }
                        if(ia < arrayA.length && ib < arrayB.length && arrayA[ia].CHIAVE === arrayB[ib].CHIAVE) {

                            let recordtoupdate=parameters.columnMap(arrayA[ia]);


                            let arrayupdate=Object.entries(recordtoupdate);
                            let shouldupdate= arrayupdate.some(([fieldName,fieldvalue]) => fieldvalue !== arrayB[ib][fieldName]);
                           // this.update(arrayB[ib].id,arrayA[ia]);
                            if(shouldupdate){
                                this.update(arrayB[ib].id,recordtoupdate); 
                            }
                           
                            ia ++;
                            ib++;
                        }
                        else if(ib >= arrayB.length || (ia < arrayA.length && arrayA[ia].CHIAVE < arrayB[ib].CHIAVE ))  
                        {
                    
                            //  arrayB.splice(ib, 0, arrayA[ia]);
                                arrayI.push(arrayA[ia]); //inserisco nell'array I gli elementi da aggiungere
                                ia ++; //verificare se non va aumentato anche ia
                        }
                        else { 
                            //  A>B oppure B è nulla: record da cancellare da B
                                arrayD.push(arrayB[ib]); //inserisco nell'arrayD gli elementi da eliminare 

                                ib ++;
                            }
                         
                    
     
           
        }
 //manca ancora la delete
 console.log('faccio la insert');
   //  console.log(arrayI);
     this.insert(arrayI);
     return ;
     // ritorna l'array aggiornato di ciò che abbiamo in locale con le nuove righe o quelle a cui abbiamo aggiornato i campi
    //fine funzione
    }
}

exports.EntityBE = EntityBE;
