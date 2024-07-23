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
// require("../../test/_test-setup");

const SitoExt = require("../data/SitoExt");
const {Chunknizer} = require("normaly");


describe("Chunk-nizer test", function () {

    // it("finds out chunks from site", async function () {

    //     let query = DeviceExt.select();

    //     let outChunks = await Chunknizer.split(query, {
    //         pageSize: 100,
    //         // columnName: "serial_number",
    //         columnName: "ID_AS400",
    //         minChunksize: 50,
    //     });

    //     assert(outChunks);
    // })
    it("finds out chunks from site", async function () {

        let query = SitoExt.select();

        let chunknizer = Chunknizer.compose( query, {
            pageSize: 500,
            // columnName: "serial_number",
            columnName: "ID_AS400",
            minChunksize: 100,
        })

        let chunk;
        let outChunks = [];
        
        while ( chunk = await chunknizer.next() ) {
            // 
            if ( chunk ) {
                outChunks.push( chunk );
            }
        };

        assert(outChunks);
    })
});

