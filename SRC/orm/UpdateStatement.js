/**
 * 
 */
const { Statement } = require("./Statement");


/**Update Statement
 * 
 */
class UpdateStatement extends Statement {

    constructor( entity ) {
        super( entity );
    }

    // value( record ) {
    //     // TODO: parse object and keep only column defined in model
    //     // should handle object link's field values passed 
    //     // as ObjectLink: { id: xxx, label: 'xxx' }
    //     // can use this.entity.parse( record )...
    //     this.processedRecord = record;
    //     return this;
    // }
    
    autoInsertNewObjectLookupValues( value=true ){
        this.autoInsertNewObjectLookupValuesEnabled = value;
    }
}

exports.UpdateStatement = UpdateStatement;
