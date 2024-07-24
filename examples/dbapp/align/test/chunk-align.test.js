/** Test for case study of join between an 
 * external source and internal destination
  * The source is a json data
  * 
  * 
  * @usage
  *  VSCode run and debug: Debug Mocha Test
  * 
  * or
  * 
  *  cd examples/dbapp
  *  mocha align/test/align.test.js  
  *  
  * With coverage:
  *  npx nyc --reporter=text mocha align/test/join.test.js 
  */
const {assert,expect} = require("chai");
require("../../test/_test-setup");

const Contact = require("../../models/Contact");
const ContactExt = require("../data/ContactExt");
const {Chunknizer} = require("normaly");


describe("Chunk-align test", function () {

    it("finds out chunks from site", async function () {

        let query = ContactExt.select();

        let chunknizer = Chunknizer.compose( query, {
            pageSize: 500,
            // columnName: "serial_number",
            columnName: "CODE",
            minChunksize: 100,
        })

        let chunk;
        let outChunks = [];
        
        while ( chunk = await chunknizer.next() ) {
            // 
            outChunks.push( chunk );

            

            let dest = Contact.select()
                // .where("CODE",">=", chunk.from)
                // .where("CODE","<=", chunk.to)
                .where(Contact.code.greaterOrEqualThan( chunk.from ) )
                .where(Contact.code.lessOrEqualThan( chunk.to ) )
                .orderBy(Contact.code)
                .setRange(5000);

            Contact.alignNew( dest, source )

        };

        assert(outChunks);
    })
});

