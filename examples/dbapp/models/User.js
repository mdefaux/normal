/**File: models/User.js
 * Creates a simple model of User based on a db table 
 * called user_t.
 */
 const store = require("./store");

 /**User model is a simple table with 
  * domain name and name
  * 
  */
 var User = store.entity( "User", (model) => {
 
     // there is a table called 'user_t' on DB
     model.source( "user_t" );
 
     // defines the columns/fields of thi model
     model.id( "id" );
     model.label('domain_name');   // there is a string field domain_name that id used as label for that row

    // model.label('domainName')
    //     .source( "domain_name" );
     model.string("name");          // name of user
 } );
 
 module.exports = User;