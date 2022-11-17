# Normaly
Network distributed Object Relation Model. Do query and sql operations across network multiple database and integrate REST API as SQL interface.

## Purpose
In data management and normalization projects, we often met the need of using model meta data either in backend, when etracting the data from a source, and in front end, when presenting data to user and handling diffent columns type with appropriate functions. Traditional Object Relation Model often works in backend, leaving perhaps few freedom in data query, and produce structured objects (with no meta data) to send across the network response; then this object is received by client which should interpret data with another frontend-model: this cause to repeat structures of metadata and to increase the probability of errors. the purpose of normal is to have a single Data Relation and Definition Model across tiers.


## How to install

    npm install normaly

# Examples

## Initialize the store

```javascript
/**File: models/store.js
 * Creates a store, a collection of all models.
 * In this example a Knex db store is used.
 */

// includes the normaly store and the knex store
const { store, KdbStoreHost } = require("normaly");
// includes your knex connection definition 
const knex = require( '../../db/knex' );

// Initializes store with your knex db connection
store.setup( new KdbStoreHost( knex ) );

// exports the store object
module.exports = store;
```

## Creates the User model

```javascript
/**File: models/User.js
 * Creates a simple model of User based on a db table 
 * called user_t.
 */
const store = require("./store");

/**User model is a simple table with 
 * domain name and name
 * 
 */
var User = store.entity("User", (model) => {

    // there is a table called 'user_t' on DB
    model.source("user_t");

    // defines the columns/fields of this model
    model.id("id");
    model.label('domainName')    // domainName is used as 'label' for this entity
        .source('domain_name');     // domain_name is the name of the column on the table

    model.string("name");          // name of user
});

module.exports = User;
```

## Creates the Project model

```javascript
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

  model.objectLink(User)      // Links to User model
    .source("id_user");     // specifies the foreign key column on table project_t to user_t
});

module.exports = Project;
```

## Defines a route in node express

```javascript
/**File: routes/projectRoute.js
 * queries the project table, 
 * filtering for those project of the given user passed to url
 */
 const Project = require("../models/Project");
 const User = require("../models/User");
 const projectRoute = require("express").Router();
 
 projectRoute.route("/project/:username?")
     .get((req, res) => {
     
     // queries the project table, 
     // filtering for those project of the given user passed to url.
     // if no username is specified, using .where( false ) all project will be 
     // selected and returned.
     return Project
         .select( '*' )      // selects all fields
         .joinAllRelated()   // all related table are join in order to filtering
         .where( req.params.username && User.domain_name.equals( req.params.username ) )
         .then( (data) => {
 
             return res.send(data);
         } )
         .catch( (err) => {
             
             console.error(err);
             res.status(500).json({ error: true, data: { message: err.message } });
         } );
 
 });

module.exports = projectRoute;
```

