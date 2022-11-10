/**File: models/Project.js
 * Creates a model for Projects.
 * There is a foreign key on project_t on column id_user to user_t table.
 */
 const store = require("./store");
 const User = require("./User");
 
 var Project = store.entity("Project", model => {
   // there is a table called 'project_t' on DB
   model.source("project_t");
 
   // model.id( "id" );      // optional, primary key is 'id' by default
   model.label("name");      // the label field can be used to briefly stringify the project
 
   model.string("name");         // specifies the name field (optional)
   model.string("description");  // description
   
   model.objectLink( User )      // Links to User model
       .source( "id_user" );     // specifies the foreign key column on table project_t to user_t
 });
 
 module.exports = Project;