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

const DeviceExt = require("../data/DeviceExt");
const { off, param } = require("../../app");

// const Chunknizer = require("../data/Chunknizer");
const Chunknizer = {

    minChunksize: 3,
    
    sameRange( c1, c2 ) {

        if ( c1 >= 'A' && c1 <= 'Z' && c2 >= 'A' && c2 <= 'Z') {
            return true;
        }
        if ( c1 >= 'a' && c1 <= 'z' && c2 >= 'a' && c2 <= 'z') {
            return true;
        }
        if ( c1 >= '0' && c1 <= '9' && c2 >= '0' && c2 <= '9') {
            return true;
        }

        return false;
    },

    iterate( data, state ) { // base = "", chunkMaxPage, offset ) {

        state.base = state.base || "";
        let dataOffset = data.slice( state.offset || 0 );

        let changeBaseIndex = dataOffset.findIndex( (row) => {
            return row.startsWith(state.base) === false;
        });

        // 
        if ( changeBaseIndex === 0 ) {
            return {...state, base: dataOffset[changeBaseIndex].substring(0, state.base.length - 1), end: false };
        }
        if ( changeBaseIndex === -1 && dataOffset.length > 0 ) {
            //return {...state, base: dataOffset[changeBaseIndex - 1].substring(0, state.base.length), end: false };
        }
        else {
            dataOffset = dataOffset.slice(0, changeBaseIndex);
        }

        if( dataOffset.length < state.minChunksize /*&& !state.fetchEnded*/ ) {
            return {...state, fetchRequest: true, end: false };
        }

        let firstEntry = dataOffset[0]?.substring(state.base.length);
        let firstChar = firstEntry[0];


        let lastEntry = dataOffset[ dataOffset.length - 1 ]?.substring(state.base.length);
        let lastChar = lastEntry[0];

        if ( firstChar === lastChar ) {
            return this.iterate( data, {...state, base: state.base + firstChar } );
        }

        let start = 0;
        let end = dataOffset.findIndex( (row) => {
            return !this.sameRange( firstChar, row.substring(state.base.length)[0] );
        });
        if ( end === -1 ) {
            end = dataOffset.length;
        }
        // this happens for special charaters '-_+*'...
        if ( end === 0 ) {
            end = 1;
        }
        let endChar = dataOffset[ end-1 ].substring(state.base.length)[0];


        return { ...state, start: start, end: end, from: firstChar, to: endChar };

    },

    async split( query, params ) {
        // checks for params
        params.pageSize = params.pageSize || 50;
        if ( !params.columnName ) {
            throw new Error("columnName is required parameter.");
        }
        params.minChunksize = params.minChunksize || 20;

        let off = 0;
        let state = { /*offset: 0,*/ base: "", minChunksize: params.minChunksize };
        let data = [];
        let outChunks = [];
        do {
            let out = await query.setRange( params.pageSize, off ).exec(); // 5 rows
            off += params.pageSize;
            
            if ( out.length < 1 ) {
                state.fetchEnded = true;
                state.minChunksize = 1;
            }
            else {
                state.fetchRequest = false;
            }
            data = data.concat( out.map( row => {
                return row[params.columnName];
            }) );
            // state.offset = 0;
            do {
                state = Chunknizer.iterate(data, state);

                if ( state.end ) {
                    outChunks.push( {
                        data: data.slice(state.start, state.end),
                        base: state.base,
                        size: state.end,
                        from: state.from,
                        to: state.to
                    } );
                    data = data.slice( state.end );
                }
            } while( !state.fetchRequest )
        } while ( data.length > 0 || !state.fetchEnded );
        return outChunks
    }
};

describe("Chunk-nizer test", function () {

    it("finds out chunks from device", async function () {

        let query = DeviceExt.select();

        // const pageSize = 5;
        // const columnName = "serial_number";
        // const minChunksize = 3;

        // let out = await query.offset( off, 5 ).exec();

        let outChunks = await Chunknizer.split(query, {
            pageSize: 5,
            columnName: "serial_number",
            minChunksize: 10,
        });

        assert(outChunks);
    })
});

