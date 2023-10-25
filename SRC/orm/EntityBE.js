/**Entity defines the structure, the fields (column table) and relations
 * with other entities.
 * 
 */
const { Utility } = require("../utils/Utility");
const { RelationEntity } = require("./RelationEntity");
const { CompareHelper } = require("./CompareHelper");

class EntityBE {
    /**
     *
     * @param {*} name
     * @param {*} model
     * @param {*} factory
     */
    constructor(name, model, factory, host) {
        // this.name = name;
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
                        // return this.model.fields[field.name];
                        
                        let copy = this.metaData.model.fields[field.name].copy();
                        copy.sourceEntity = this; //.tableAlias || this.metaData.model.dbTableName || this.metaData.model.name;
                        return copy;

                        //, this.alias || this.metaData.name );
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

    createQuery( externalParameters ) {
        // TODO: host should create/factory for query 
        // TODO: use storage query if entity is marked 'local storage'
        if ( this.storage ) {
            return this.storage.createQuery( this );
        }

        if ( this.metaData.createSelectCallback ) {
            return this.metaData.createSelectCallback( 
                this.host.createQuery( this ), externalParameters );
        }

        return this.host.createQuery( this );
    }

    createRelationQuery( relatedEntityName ) {

        
        if ( !this.metaData.relations[ relatedEntityName ] ) {
            throw new Error( `'${relatedEntityName}' is not related with entity '${this.metaData.name}'.`)
        }
        
        const queryFactory = this.metaData.relations[ relatedEntityName ].queryFactory;
        let relationQuery = queryFactory( this.createQuery() );

        
        
        if ( !relationQuery ) {
            throw new Error( `'${relatedEntityName}' is not related with entity '${this.metaData.name}'.`)
        }

        return relationQuery;
    }

    getRelation( relatedEntityName, parameters ) {

        
        if ( !this.metaData.relations[ relatedEntityName ] ) {
            throw new Error( `'${relatedEntityName}' is not related with entity '${this.metaData.name}'.`)
        }
        
        const queryFactory = this.metaData.relations[ relatedEntityName ];
        
        if ( !queryFactory ) {
            throw new Error( `'${relatedEntityName}' is not related with entity '${this.metaData.name}'.`)
        }
        // if ( !queryFactory.select ) {
        //     throw new Error( `Relation '${this.metaData.name}' - '${relatedEntityName}' has no selection query.`)
        // }
        
        // new Relation has reference to this entity
        let newRelation = new RelationEntity( this );
        // builds the relation calling the definition method defined by user
        let relationQuery = queryFactory( newRelation, this ); // .select();
        
        newRelation.init?.( parameters );
        return newRelation;

        if ( !relationQuery ) {
            throw new Error( `Relation '${this.metaData.name}' - '${relatedEntityName}' has no selection query.`)
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
        return this.createQuery()/*.fetch()*/.select(field);
    }
    
    /**Gets a record
     * 
     * @param {*} id 
     * @returns 
     */
    async getRecord( id ) {

        if ( typeof id === 'object' ) {
            // console.log( `typeof id === 'object' => '${id}'.`);
            let rr = await this.select('*')
                // .modify( qb => qb.where( id ) )
                .where( id )
                .first();
            return rr;
        }
        // console.log( `this.metaData.model.name = '${this.metaData.model.name}'.`);
        // console.log( `this.metaData.model.idField = '${this.metaData.model.idField}'.`);
        // console.log( `this[ this.metaData.model.idField ] = '${this[ this.metaData.model.idField ]?.name}'.`);
        return this.createQuery( this )
            .select('*')
            // .where( (qb) => (qb[ this.model.idField ].equals( id )) )
            .where( this[ this.metaData.model.idField ].equals( id ) )
            // .where( { [this.model.idField]: newId } )
            .then( (r) => ( r[0] ));
    }

    /**Insert a new record
     * 
     */
    async insert(record, params) {
        // saves temporary ids
        let tempId = record._id;
        delete record._id;
        // delete record[ this.model.idField ];
        //array.isArray per fare controllo se è un array

        // creates the insert statement
        let insert = this.host.createInsert(this);
        let newId = await insert.value(record).exec(); // executes the insert
        // console.log( `newId= '${newId}'.`);
        // after getting the new id, queries the new record
        if (Array.isArray(record) || newId === 0) {
            // console.log( `returning ...`);
            return newId;
        }
        let response = await this.getRecord(newId);

        if(this.metaData.model?.onInsert) {
            await this.metaData.model.onInsert(response, params);
        }

        return response;
        //  return { ...r, _id: tempId };
        //   return newId;
    }

    /**Updates a record
     * 
     * @param {*} record 
     * @returns 
     */
    async update( id, record, params /*, returning */ ) {
      //  let idFilter = record[ this.model.idField ];
        let idFilter = id;
        // creates the update statement
        let update = this.host.createUpdate( this );
        let updateRecord = await update.value(id, record ).exec(/* returning */); // executes the update

        // for now, get the updated record data with a select.
        // if(!returning || returning.length === 0) 
        if ( Array.isArray( id ) ) {
            return idFilter;
        }

        let response = await this.getRecord( idFilter )

        if(this.metaData.model?.onUpdate) {
            await this.metaData.model.onUpdate(response, record,  params);
        }

        return response;
    }

    /**Updates a record
     * 
     * @param {*} record 
     * @returns 
     */
    async delete( id ) {
        
        // creates the delete statement
        let delStatement = this.host.createDelete( this );

        //   if ( Array.isArray( id ) ) {
        await delStatement.value(id).exec(); // executes the delete
     //   }
     //   else {
        //    await delStatement.value( id ).exec(); // executes the delete
       // }
    }

    parse( object, parserData ) {

        return Object.entries(object).reduce( 
            ( prevValue, [currentKey, currentValue] ) => {

                // gets the field by its name
                let field = this.model.fields[ currentKey ]
                    // disabled: a field can be referenced by its source
                    // TODO: put false in a constant configurable in store
                    || (false && Object.entries( this.model.fields )
                    .map( ([,f]) => f )
                    .find( f => (f.sourceField === currentKey) ));

                if ( field ) {
                    return { ...prevValue, [ field.name ]: field.parseValue( currentValue )}
                }

                if ( parserData?.unknownFields ) {
                    parserData.unknownFields.push( { name: currentKey, value: currentValue } )
                }
                else if ( ! parserData?.ignoreUnknownField ) {
                    let candidates = Utility.top3Similar( currentKey, Object.keys( this.metaData.model.fields ) );

                    let msg = `NORMALY-0001 Unknown field '${currentKey}' value '${currentValue}', in entity '${this.metaData.name}'.`
                        + (candidates.length > 0 ? ` Did you mean ${candidates
                        .join( ', ' )}?` : '');
                    throw new Error( msg )
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
            throw new Error( `Action '${actionName}' not defined in entity '${this.metaData.name}' ` )
        }

        return this.actionDictionary[ actionName ];
    }

    
    async compare( sourceQuery, destQuery, parameters, chunkLimit = 1 ) {
        return CompareHelper.compare( sourceQuery, destQuery, parameters, chunkLimit );
    }

    async  allign( parameters ) {
        
        if ( !parameters.source ) {
            throw new Error( `source parameter is mandatory for allign function` );
        }
        let source = parameters.source;
        let destination = parameters.destination || this.select()
            .pageSize( 500 )
            .orderBy({ columnName: parameters.keyFieldD, order: "asc" });
        // console.log('sono nella allign');
        // TODO: alligment procedure
        // ...
        // 
        let pageA = 1;
        let pageB = 0;
        let sourcePageSize = parameters.sourcePageSize || 500;
        let insertSize = parameters.insertSize || 500;
        let keyFieldS = parameters.keyFieldS || "id";
        let keyFieldD = parameters.keyFieldD || "id";
        source.page(pageA, sourcePageSize);
        let arrayA = await source.exec();
        // console.log(arrayA);
        //il secondo array è locale
        let pageSize = parameters.destinationPageSize || 500;
        destination.page(null, pageSize);
        let arrayB =   await destination.exec();
        //  console.log(arrayB);
        let arrayI=[];
        // var arrayI = new Array();
        let arrayD=[];
        let arrayUD=[];
        let insertcount=0;
        let updatecount=0;
        let deletecount=0;
        let offsetend=0;
        let arraybend=0;
        let arrayaend=0;
        let countarrayA=sourcePageSize;
        let endfor=0;
        let alreadyMatched= false;

        for (var ia=0,ib=0; ( arrayA.length!==0 || arrayB.length!==0 ); ) 
        {                  //  console.log('righe AAAAA source:' + countarrayA , '  insert' + insertcount , '  update:' + updatecount, '  delete:' + deletecount) ;

                if( arrayA.length===ia && arrayaend===0) {

                    ia = 0
                    pageA ++;
                    source.page(pageA);
                    console.log('righe source:' + countarrayA , '  insert' + insertcount , '  update:' + updatecount, '  delete:' + deletecount) ;
                    arrayA = await source.exec();
                    if(arrayA.length===0){
                        arrayaend=1;
                    }
                    countarrayA=countarrayA+arrayA.length;
                    
                }
                
                if(arrayB.length===ib && arraybend===0) {
                    ib = 0
                    pageB ++;
                    let offset=(pageB*pageSize)+1+offsetend;
                    destination.page(null, pageSize,offset);
                    //console.log('offset arrayb:' + offset + " offsetend " + offsetend + " pageSize " +  pageSize + " pageB " + pageB);
                    arrayB =   await destination.exec();
                    if(arrayB.length===0){
                        arraybend=1;
                    }
                     

                }
                
             /*   if(ib >= arrayB.length && ia >= arrayA.length )
                {
                //    console.log('break');
                //    console.log(ii);
                        break ;
                }*/
                if (arraybend === 1 && arrayaend === 1) {
                    //  console.log(arrayI);
                    // console.log('faccio la insert pre break');
                    if (!parameters.noInsert && arrayI.length != 0) {
                        this.insert(arrayI);
                    }
                    //   console.log('faccio la delete');
                    if (!parameters.noDelete && arrayD.length != 0) {
                       // this.delete(arrayD);
                    }
                    if (parameters.noDelete && arrayD.length != 0) {
                        if(parameters.removed != 'undefined')
                        {
                            //aspetta che tutti gli update siano stati fatti effettivamente
                           await Promise.all(arrayD.map(r=> this.update(r[this.metaData.model.idField], parameters.removed)));
    
                            }      
         }
                    endfor = 1;
                    break;
                }
                
                // 
                let sourceRecord = arrayA[ia];
                if(parameters.columnMap && arrayaend != 1) {
                    sourceRecord = parameters.columnMap(arrayA[ia]);
                }
                if(parameters.parseValue && arrayaend != 1) {
                    let keys = Object.keys(sourceRecord);
                    keys.forEach(key => {
                        sourceRecord[key] = parameters.parseValue(sourceRecord[key]);
                    })
                }

                // it finds a match between the 2 key fields
                if(ia < arrayA.length && ib < arrayB.length 
                    && arrayA[ia][keyFieldS] === arrayB[ib][keyFieldD]) {
//console.log(arrayA[ia][keyFieldS] +'='+arrayB[ib][keyFieldD] );
                // let recordtoupdate=parameters.columnMap(arrayA[ia]);


                    // let arrayupdate=Object.entries(recordtoupdate);
                    let arrayupdate = Object.entries(sourceRecord);
                    // let shouldupdate= arrayupdate.some(([fieldName,fieldvalue]) => fieldvalue !== arrayB[ib][fieldName]);
                    let shouldupdate = arrayupdate.reduce((accumulator, [fieldName, fieldvalue]) => {
                        let field = this.model.fields[fieldName];

                        //   let value = fieldvalue;

                        //    if (parameters.parseValue) value = parameters.parseValue(fieldvalue);

                        if (!field.equalValues(fieldvalue, arrayB[ib][fieldName])) { 
                            return [...accumulator, { 
                                fieldName: fieldName, 
                                srcValue: field.parseValue(fieldvalue), 
                                destValue: field.parseValue(arrayB[ib][fieldName]) 
                            }] 
                        }
                        return accumulator;
                    }, []);
                    // this.update(arrayB[ib].id,arrayA[ia]);
                    if (shouldupdate.length > 0) {

                        let recordtoupdate = Object.fromEntries(shouldupdate.map(u => ([u.fieldName, u.srcValue])));
                        //console.log(recordtoupdate + ': ' + arrayB[ib].id);
                        await     this.update(arrayB[ib][this.metaData.model.idField], recordtoupdate);
                        updatecount++;
                    }

                    if (!parameters.destHasDuplicateKeys) { // sourceHasDuplicateKeys) {
                        ia++;
                    }
                    else {
                        alreadyMatched = arrayA[ia][keyFieldS];
                    }
                    if (!parameters.sourceHasDuplicateKeys) {
                        ib++;
                    }
                    else {
                        alreadyMatched = arrayB[ib][keyFieldD];
                    }
                }
                else if(ib >= arrayB.length || (ia < arrayA.length && arrayA[ia][keyFieldS] < arrayB[ib][keyFieldD] ))  
                {
            
                    //  arrayB.splice(ib, 0, arrayA[ia]);
                    //    arrayI.push(arrayA[ia]); //inserisco nell'array I gli elementi da aggiungere
                    arrayI.push(sourceRecord); //inserisco nell'array I gli elementi da aggiungere
                    insertcount ++;
                    ia ++; //verificare se non va aumentato anche ia
                }
                else {
                    //  A>B oppure B è nulla: record da cancellare da B
                    //    arrayD.push(arrayB[ib]); //inserisco nell'arrayD gli elementi da eliminare 
                    //    arrayD.push(sourceRecord[this.metaData.model.idField]); //inserisco nell'arrayD gli elementi da eliminare 
                    // arrayD.push(arrayB[ib][this.metaData.model.idField]); //inserisco nell'arrayD gli elementi da eliminare 
                    // let element ={id: arrayB[ib][this.metaData.model.idField]}
                    if (arrayB[ib][keyFieldD]!==alreadyMatched) {
                       // console.log(arrayA[ia][keyFieldS] +'='+arrayB[ib][keyFieldD] );
                        arrayD.push(arrayB[ib]); //inserisco nell'arrayD gli elementi da eliminare 
                        deletecount++;
                    }
                    ib++;
                }
                if(arrayD.length>=50){

                    //   console.log('faccio la delete');
                    if (!parameters.noDelete) {
                        if(parameters.removed != 'undefined'){
                        //aspetta che tutti gli update siano stati fatti effettivamente
                       await Promise.all(arrayD.map(r=> this.update(r[this.metaData.model.idField], parameters.removed)));

                        }
                        else{
                            await this.delete(arrayD);
                    }
                    
                    offsetend = offsetend - arrayD.length;
                    }

                    arrayD = [];
                }       
                if (arrayI.length >= insertSize) {
                    // console.log('faccio la insert da 500');
                    //  console.log(arrayI);
                    if (!parameters.noInsert) {
                        await   this.insert(arrayI);
                        offsetend = offsetend + arrayI.length;
                    }
                    arrayI = [];
                }         
                    
     
           
        }
        if (arrayI.length >= 1 && endfor != 1 && !parameters.noInsert) {
            await   this.insert(arrayI);
        }
        if (arrayD.length >= 1 && endfor != 1 && !parameters.noDelete) {
            // la delete di un array vuoto esplode
            await   this.delete(arrayD);
        }

        return;
        // ritorna l'array aggiornato di ciò che abbiamo in locale con le nuove righe o quelle a cui abbiamo aggiornato i campi
        //fine funzione
    }

}

exports.EntityBE = EntityBE;
