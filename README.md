# Normaly
Network distributed Object Relation Model. Do query and sql operations across network multiple database and integrate REST API as SQL interface.

## Purpose
In data management and normalization projects, we often met the need of using model meta data either in backend, when etracting the data from a source, and in front end, when presenting data to user and handling diffent columns type with appropriate functions. Traditional Object Relation Model often works in backend, leaving perhaps few freedom in data query, and produce structured objects (with no meta data) to send across the network response; then this object is received by client which should interpret data with another frontend-model: this cause to repeat structures of metadata and to increase the probability of errors. the purpose of normal is to have a single Data Relation and Definition Model across tiers.


## How to install

    npm install normaly

# Examples

## parse
const {URLQuery} = require ('normaly');

let {filters, selectedFields, groupedFields} = URLQuery.parse( req, responseModel, relation ) ; 

