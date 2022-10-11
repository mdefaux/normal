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

    // TODO: 'then' should call 'exec'
    async exec(){
        return this;
    }

    then(callback) {

        return this.exec().then(callback);
    }
  
    debug() {
        this.debugOn = true;
        return this;
    }
}

exports.Statement = Statement;
