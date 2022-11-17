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
         .where( req.params.username && User.domainName.equals( req.params.username ) )
         .then( (data) => {
 
             return res.send(data);
         } )
         .catch( (err) => {
             
             console.error(err);
             res.status(500).json({ error: true, data: { message: err.message } });
         } );
 
 });

module.exports = projectRoute;