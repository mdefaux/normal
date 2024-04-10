
var store = require( './store' );


module.exports = store.entity( 'Flow', (model) => {

    model.source( 'flow' );

    model.string( 'name' );
    model.label( 'name' );

    model.string( 'severity_status' );
    model.string( 'message' );

    model.integer("updated_rows"),                     // 
    model.integer("inserted_rows"),                    // 
    model.integer("deleted_rows"),                     // 
    // model.integer("rows_processed"),
    model.integer("rows_in_warning"),
    model.integer("threshold_insert"),                 // 
    model.integer("threshold_delete"),                 // 
    model.string("logging_level", 1),   // I=Info, W=Warning, E=Error, C=Critical

    model.date("last_exec");
    model.date("next_exec");

} );
