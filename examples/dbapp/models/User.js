/**File: models/User.js
 * Creates a simple model of User based on a db table 
 * called user_t.
 */
const store = require('./store');

/**User model is a simple table with 
 * domain name and name
 * 
 */
var User = store.entity('User', (model) => {

    // there is a table called 'user_t' on DB
    model.source('user_t');

    // defines the columns/fields of this model
    model.id('id');
    model.string('domainName')    // domainName is used as 'label' for this entity
        .source('domain_name');     // domain_name is the name of the column on the table

    model.string('name');          // name of user
    model.string( 'email' );
    model.string( 'telephone' );
});

module.exports = User;