/**
 * "boot" file for test
 * Setta le variabili d'ambiente per lanciare il db test su docker.
 * Importa le librerie e imposta le azioni prima di ogni test
 * per resettare e ripopolare da zero il db.
 *
 * Per lanciare tutti i test nella cartella eseguire:
 * mocha test/_test-setup.js --exit test/ --recursive --timeout 15000
 *
 * devi avere installato mocha globally: npm i mocha -g
 * 
 * Se compare l'errore: Error: connect ECONNREFUSED 127.0.0.1:5432
 * vuol dire che non è stato avviato il container pg-normalize-dbapp
 */
 process.env.NODE_ENV = "test"; // sets the test mode in env variabile
 process.env.LOGGER = undefined;
 
 var chai = require('chai');           // il motore di test
 var should = chai.should();           // serve per fare asserzioni 
 var {expect} = chai;                  // asserzioni di tipo 'expect'
 var server = require('../../app');    // richiama l'app come se fosse un server
 var knex = require('../../db/knex');  // crea la connessione al db (lite)
 var chaiHttp = require('chai-http');  // per interrogare le api
 chai.use(chaiHttp);                   // consente di effettuare le chiamate alle api
 
 // Prima di iniziare i test mette tra le variabili globali
 // delle funzioni utili a tutti i test, per evitare di fare le require
 before(async function() {
     global.chai = chai;
     global.expect = expect;
     global.server = server;
     global.should = should;
 
     console.log( "API RUN MIGRATE!" );
     await knex.migrate.rollback();
     await knex.migrate.latest();
     await knex.seed.run();
 });
 
 // Prima di ogni test fa il drop di tutte le tabelle,
 // e riscostruisce il db con i dati iniziali di test.
 // beforeEach(async function() {
 //     // console.log( "API RUN MIGRATE!" );
 //     await knex.migrate.rollback();
 //     await knex.migrate.latest();
 //     await knex.seed.run();
 // });
   
 // finiti tutti i test ricostruisce il db lite con i dati iniziali
 after(async function() {
     await knex.migrate.rollback();
     await knex.migrate.latest();
     await knex.seed.run();
 });
 
 