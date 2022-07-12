/**Route generica che utilizza il model BE
 * per fornire i metodi di GET, POST e le operazioni
 * query, summary, group by...
 * 
 */

const {URLquery} = require('normalize');
var defs = require("../models/index");
//  var express = require("express");
var ormGenericRoute = require("express").Router();
 
//  modelRoute.route("/").get((req, res) => {
//    let responseModel = defs;
 
//    return res.send(responseModel);
//  });


ormGenericRoute.route("/count/:entity/").get((req, res) => {
    //   console.log('sono nella count');
  
    // let fromRecordIndex = parseInt(
    //   !isNaN(req.params.startingFromIndex) ? req.params.startingFromIndex : 0
    // );
    // let toRecordIndex =
    //   fromRecordIndex + (parseInt(req.params.recordToExtract) || defaultPageSize);
  
    // // let orderby = "MSACOD";
  
    // // console.log(    `contratto route fetch from ${fromRecordIndex} to ${toRecordIndex} index.' `  );
  
    // let andwhere = externals.applyFilter(req.query, Contratto);
  
    // if (andwhere === "") {
    //   return res.status(200).json([{ COUNT: 100000, moreRecords: true }]);
    // }
    // // Mi compongo la richiesta all'xml.
    // // In futuro posso dividere anche la query in più variabili in modo da modificare più comodamente i campi della SELECT e quelli della WHERE
  
    // // TODO quando si dovranno applicare i filtri che mi passa la forte, richiamerò la funzione applyFilter definita sopra prima di definire l'oggetto "options"
  
    // let sql = ` select count(*) as count from $D_ASLLSPA/WEMC0F where 1=1 ${andwhere}`;
    // // console.log("sono nella count WEMC0F");
    // // console.log(sql);
  
    // queryWsdl(sql)
    //   .then(xml => {
    //     var response_object = parseXML(xml);
  
    //     return res.status(200).json(response_object);
    //   })
    //   .catch(err => {
    //     console.error("prova count");
    //     res.status(400).json(err);
    //   });
  });

  function translateFormat( responseModel ) {

    let ndef = '';
    let otherDefs = [];
    let otherDefSP = 0;

    ndef +=( `\n  definition( model ) {` );
    ndef +=( `\n    model.source( "${responseModel.table}" )` );

    Object.entries( responseModel.columns )
        .forEach( ([name,f]) => {
            if( name === 'id' )
                return;
            if ( (f.type === 'string' || !f.type) && name !== 'id' ) {

                ndef +=( `\n    model.string( '${f.name||name}' )` )
            }
            else if ( f.type === 'ObjectLink' ) {

                let otherName = f.table.charAt(0).toUpperCase() + f.table.slice(1);
                ndef +=( `\n    model.objectLink( ${otherName} )` )

                otherDefs[ otherDefSP ] = `\n\nclass ${otherName} extends EntityBE {`;
                otherDefs[ otherDefSP ] += `\n  definition( model ) {`;
                otherDefs[ otherDefSP ] += `\n    model.source( "${f.table}" );`
                otherDefs[ otherDefSP ] += `\n    model.id( "${f.id_field}" );`
                otherDefs[ otherDefSP ] += `\n    model.label( "${f.label_field}" );`
                otherDefs[ otherDefSP ] += `\n    model.${f.dataType}( "${f.label_field}" );`
            
                // model.id( "id" );
                // model.label( "nome" );`;
                otherDefs[ otherDefSP ] += `\n  }`;
                otherDefs[ otherDefSP ] += `\n}`;

                otherDefSP++;
            }

            if ( f.db_name ) {

                ndef +=( `\n      .source( '${f.db_name}' )` )
            }
            if ( f.label ) {

                ndef +=( `\n      .label( '${f.label}' )` )
            }
            if ( f.defaultColumnWidth ) {

                ndef +=( `\n      .defaultColumnWidth( ${f.defaultColumnWidth} )` )
            }
            if ( f.readonly !== undefined ) {

                ndef +=( `\n      .readonly( ${f.readonly} )` )
            }
            if ( f.mandatory !== undefined ) {

                ndef +=( `\n      .mandatory( ${f.mandatory} )` )
            }
            if ( f.save !== undefined ) {

                ndef +=( `\n      .save( ${f.save} )` )
            }

        } );
    ndef +=( `\n  }` );

    // otherDefs.forEach( (od) => console.log( od ) );
    // console.log( ndef );
  }

// /groupby/:columnName/:recordToExtract/:startingFromIndex
ormGenericRoute.route("/model/:entity")
    .get((req, res) => {
    // console.log( `Entity: ${req.params.entity}` );
    let responseModel = defs[req.params.entity].getModel();

    return res.send(responseModel);
});

/*
// /groupby/:columnName/:recordToExtract/:startingFromIndex
ormGenericRoute.route("/groupby/:entity/:columnName/:recordToExtract/:startingFromIndex")
.get((req, res) => {
    console.log( `Entity: ${req.params.entity}` );
    let responseModel = defs[req.params.entity];

    return res.send(responseModel);
});

ormGenericRoute.route("/:entity/:relation/:related_id")
.get((req, res) => {
    console.log( `Entity: ${req.params.entity}` );
    let responseModel = defs[req.params.entity];

    return res.send(responseModel);
});
*/
 
ormGenericRoute.route("/:entity/:relation?/:recordToExtract?/:startingFromIndex?")
    .get((req, res) => {
    // console.log( `Entity: ${req.params.entity}` );
    // console.log( `Relation: ${req.params.relation}` );
    // console.log( `Defs: ${Object.keys( defs )}` );
    let responseModel = defs[req.params.entity];

    if ( !responseModel ) {
        let message = `Unknown entity '${req.params.entity}'.`;
        res.status(500).json({ error: true, data: { message: message } });
        console.error( message );
    }
    
    let {filters, selectedFields, groupedFields} = URLquery.parse( req.query, responseModel, req.params.relation !== 'all' && req.params.relation );
    // let filters = false; // 
    // let selectedFields = false; //
    // let groupedFields = false; //

    // return responseModel.getRelationData()
    return responseModel
        .fetch()
        .joinAllRelated()
        .relation( req.params.relation !== 'all' && req.params.relation )
        .select( selectedFields )
        .where( filters )
        .groupBy( groupedFields )
        .then( (data) => {

            return res.send(data);
        } )
        .catch( (err) => {
            console.error(err.message);
            res.status(500).json({ error: true, data: { message: err.message } });
        } );

});


module.exports = ormGenericRoute;
