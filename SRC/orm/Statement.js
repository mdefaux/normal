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
