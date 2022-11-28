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

    /**Method to override for specific build
     * 
     */
    build () {}

    /**Method to override for specific execution
     * 
     */
    execute () {}

    // TODO: 'exec' should call 'execute'
    async exec(){

        // TODO: call before exec
        if ( this.beforeExecCallback ) {
            await this.beforeExecCallback( this );
        }
        this.build();

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
