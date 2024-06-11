
import store from './store.js';


export default store.entity( 'Log', (model) => {

    model.source( 'log' );

    model.string( 'severity' );
    model.string( 'what' );
    // id_user TBD
    model.date( 'log_date' );
    model.string( 'activity_type' );
} );
