/**Root class for Statement as Query, Update, Insert and Delete
 * 
 */

/**Statement abstract class
 * 
 * @subclass: Query, UpdateStatement, InsertStatement, DeleteStatement
 */
class Statement {

    constructor( entity ) {
        this.entity = entity;

        this.setup();
    }


    setup() {
        
    }

    clone( ref ) {
      let cloned = ref;
  
      cloned.entity = this.entity;
      cloned.debugOn = this.debugOn;
  
      return cloned;
    }

    /**Method to override for specific build
     * 
     */
    build () {}

    /**Method to override for specific execution
     * 
     */
    execute () {}

    /**Tries to resolve promises to get value 
     * (eg: object link lookups)
     * 
     */
    async buildProcessedRecord() {
        if ( !this.processedRecord ) {
            return;
        }
        let cache = {};


        if (  !Array.isArray( this.processedRecord ) ) {
            this.processedRecord = await this.resolveRecord( this.processedRecord, cache );
            return;

         
        }

        
        /*           this.processedRecord = await Promise.all( 
                this.processedRecord.map( (pr) => (
                    this.resolveRecord( pr, cache )
                ) ) 
            ); */

        for(let i= 0; i<this.processedRecord.length; i++) {
            this.processedRecord[i] = await this.resolveRecord(this.processedRecord[i], cache);
        }
           
        
    }

    async resolveRecord( record, cache ) {
        if (typeof record !== "object") return record;
        
/*         return Object.fromEntries( await Promise.all (
            Object.entries( record ).map( async ([key,value]) => {
                if ( typeof value === 'function' ) {
                    value = await value( cache, this );
                }

                return [key,value];
            })
        )) */
        let r = [];

        for (let [key, value] of Object.entries(record)) {
            if(typeof value === 'function') {
                value = await value(cache, this);
            }

            r.push([key, value]);

        }

        return Object.fromEntries(r);

    }

    // TODO: 'exec' should call 'execute'
    async exec(){

        // TODO: call before exec
        if ( this.beforeExecCallback ) {
            await this.beforeExecCallback( this );
        }
        this.build();

        // this step tries to resolve promises to get value (eg: object link lookups)
        await this.buildProcessedRecord();

        // handle value to insert/update/delete if array
        // exceed the maximum number of element of the chunk
        const chunkSize = 100;
        if ( this.processedRecord 
            && Array.isArray( this.processedRecord ) 
            && this.processedRecord.length > chunkSize ) 
        {
            // stores the array of record to process
            let tempArray = this.processedRecord;
            // array of promise returned by each execution
            let promises = [];
            // calls execution for each chunk of the array
            for (let i = 0; i < tempArray.length; i += chunkSize) {
                this.processedRecord = tempArray.slice(i, i + chunkSize);
                // do whatever
                promises.push( await this.execute() );
            }
            // syncronizes all execution promises
            return Promise.all( promises );
        }

        return this.execute();
    }

    then(callback) {

        return this.exec().then(callback);
    }
  
    debug() {
        this.debugOn = true;
        return this;
    }

    toRaw( objectRecord ) {

        objectRecord = this.entity.parse( objectRecord );

        let rawEntries = Object.entries( objectRecord )
            .map( ([fieldName,value]) => (
                this.entity.model.fields[ fieldName ].toRaw( value )
            ));

        return Object.fromEntries( rawEntries );
    }

    value( record ) {
        // checks if array is passed
        if ( Array.isArray( record ) ) {
            this.processedRecord = record.map( (r) => (
                this.toRaw( r )
            ));
        }
        else {
            this.processedRecord = this.toRaw( record );
        }
        return this;
    }

    externalParameters ( externals ) {
        if ( !externals ) {
            return this;
        }
        if ( typeof externals !== 'object' ) {
            throw new Error( `External parameters should be an object with key-values.` );
        }
        this.externals = { ...this.externals || {}, ...externals };
        return this;
    }
}

exports.Statement = Statement;
