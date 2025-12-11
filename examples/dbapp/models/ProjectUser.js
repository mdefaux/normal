/**Defines a normaly entity model for the ProjectUser
 * Represents the many-to-many relationship between Projects and Users
 */
const store = require( './store' );
const ProjectUser = store.entity( 'ProjectUser', ( model ) => {

    model.source( 'project_user' );
    // model.integer( 'project_id' ).notNull();
    // model.integer( 'user_id' ).notNull();

    model.objectLink( 'Project' )
        .source( 'project_id' );
    model.objectLink( 'User' )
        .source( 'user_id' );
} );

module.exports = ProjectUser;
/** End of ProjectUser model definition
 */