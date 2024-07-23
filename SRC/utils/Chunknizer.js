
// const Chunknizer = require("../data/Chunknizer");
const Chunknizer = {

    // minChunksize: 3,
    
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
        
        if( dataOffset.length < state.minChunksize /*&& !state.fetchEnded*/ ) {
            return {...state, fetchRequest: true, end: false };
        }

        let closingAGroup = false;
        let changeBaseIndex = dataOffset.findIndex( (row) => {
            return row.startsWith(state.base) === false;
        });

        // 
        if ( changeBaseIndex === 0 ) {
            return { ...state, start: 0, end: false, from: undefined, to: undefined, popStack: true };
            // return {...state, base: dataOffset[changeBaseIndex].substring(0, state.base.length - 1), end: false };
        }
        if ( changeBaseIndex === -1 && dataOffset.length > 0 ) {
            //return {...state, base: dataOffset[changeBaseIndex - 1].substring(0, state.base.length), end: false };
        }
        else {
            dataOffset = dataOffset.slice(0, changeBaseIndex);
            closingAGroup = true;
        }

        let firstEntry = dataOffset[0]?.substring(state.base.length);
        let firstChar = firstEntry[0];


        let lastEntry = dataOffset[ dataOffset.length - 1 ]?.substring(state.base.length);
        let lastChar = lastEntry[0];

        if ( firstChar === lastChar && firstChar !== undefined ) {
            if ( !closingAGroup && !state.fetchEnded ){
                return this.iterate( data, {...state, base: state.base + firstChar, stack: [...state.stack||[], {base: state.base}] } );
            }
            return { ...state, start: 0, end: dataOffset.length, from: firstChar, to: lastChar, popStack: true };
        }

        let start = 0;
        let end = dataOffset.findIndex( (row) => {
            return !this.sameRange( firstChar, row.substring(state.base.length)[0] );
        });
        if ( end === -1 ) {
            // checks for data, NOT for dataOffset
            if ( data.length < state.minChunksize /*&& !state.fetchEnded*/ ) {
                return {...state, fetchRequest: true, end: false };
            }
            let fromEnd = [...dataOffset].reverse().findIndex( (row) => {
                return row.substring(state.base.length)[0] !== lastChar;
            })
            end = dataOffset.length - fromEnd;
            state.next = dataOffset[ end ];

            if ( end < state.minChunksize ) {
                // debugger;
            }

        }
        // this happens for special charaters '-_+*'...
        if ( end === 0 ) {
            end = 1;
        }
        let endChar = dataOffset[ end-1 ].substring(state.base.length)[0];


        return { ...state, start: start, end: end, from: firstChar, to: endChar };

    },

    checkParameters( params ) {
        params.pageSize = params.pageSize || 50;
        if (!params.columnName) {
            throw new Error("columnName is required parameter.");
        }
        params.minChunksize = params.minChunksize || 20;
        return params;
    },

    async split( query, params ) {
        // checks for params
        this.checkParameters( params );

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
    },

    compose( query, params ) {
        // checks for params
        this.checkParameters( params );

        let chunknizer = {
            query: query,
            params: params,
            data: [],
            offset: 0,
            state: { /*offset: 0,*/ base: "", minChunksize: params.minChunksize },
            
            async fetch() {
                let out = await query.setRange(this.params.pageSize, this.offset).exec(); // 5 rows
                this.offset += this.params.pageSize;

                if (out.length < 1) {
                    this.state.fetchEnded = true;
                    this.state.minChunksize = 1;
                }
                else {
                    this.state.fetchRequest = false;
                }
                this.data = this.data.concat(out.map(row => {
                    return row[this.params.columnName];
                }));
            },

            async next() {
                if (this.data.length < this.params.pageSize && !this.state.fetchEnded) {
                    await this.fetch();
                }
                let outChunks = false;
                this.state.next = undefined;
                this.state = Chunknizer.iterate(this.data, this.state);

                if ( this.state.popStack ) {
                    this.state.popStack = false;
                    let closedGroup = this.state.stack.pop();
                    this.state.base = closedGroup.base;
                    
                    if ( !this.state.end ) {
                        return await this.next();
                    }

                }
                if ( !this.state.end ) {
                    return false;
                }
                outChunks = {
                    data: this.data.slice(this.state.start, this.state.end),
                    base: this.state.base,
                    size: this.state.end,
                    from: this.state.from,
                    to: this.state.to,
                    next: this.state.next
                };
                this.data = this.data.slice( this.state.end );
                return outChunks;
            }
        } 
        
        return chunknizer;
    }
};

exports.Chunknizer = Chunknizer;
