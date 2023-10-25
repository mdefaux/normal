

const CompareHelper = {

    

    async compareChunk( accumulator, sourceQuery, destQuery, parameters, chunk = 0 ) {
        let notInSource = {};
        let notInDest = {};
        let match = {};

        let sourcePageSize = parameters.sourcePageSize || 500;
        let keyFieldSource = parameters.keyFieldS || "id";
        let keyFieldDest = parameters.keyFieldD || "id";
        let destEntity = destQuery.entity;

        // sets the chunk dimension to the query
        sourceQuery.page( chunk+1, sourcePageSize );
        let sourceRsChunk = await sourceQuery.exec();

        let keyToFind = sourceRsChunk
            .map( (rec) => rec[keyFieldSource] )
            .sort();

        // 
        // let pageSize = parameters.destinationPageSize || 500;
        // destQuery.page(null, sourcePageSize*2);

        let destMatchQuery = destQuery.clone();
        destMatchQuery.page(null, sourcePageSize*2);
        // finds all destination records which have the key field
        let destRs = await destMatchQuery.where( destEntity[keyFieldDest].in( keyToFind ) ).exec();

        if ( destRs.length > sourceRsChunk.length ) {
            console.warn( `Destination records (${destRs.length}) greater than source records (${sourceRsChunk.length})` );
            // destRs.sort( (a,b)=>a[keyFieldDest]<b[keyFieldDest] )
        }

        // adds destination records that match in 'matches' key/value map
        let result = destRs.reduce( ( acc, rec ) => {

            // checks if already present in match map
            if ( acc.matches[ rec[keyFieldDest] ] ) {
                // adds record to "duplicate keys" array
                return { 
                    matches: acc.matches, 
                    duplicateKeys: [...acc.duplicateKeys, rec[keyFieldDest] ] 
                }
            }
            // adds record to 'matches' key/value map
            return { 
                matches: {...acc.matches, [rec[keyFieldDest]]: rec }, 
                duplicateKeys: acc.duplicateKeys 
            }
        }, { matches: accumulator.matches || {}, duplicateKeys: accumulator.duplicateKeys || [] } );

        // builds a map with the result

        match = result.matches;
        
        // match = Object.fromEntries(destRs.map( (rec) => ([ rec[keyFieldSource], rec ]) ));

        // let notInSourceRS = await destRs.where( this[keyFieldDest].notIn( keyToFind ) ).exec();
        // notInSource = Object.fromEntries(arrayB.map( (rec) => ([ rec[keyFieldSource], rec ]) ));

        // 
        let sourceRsChunkNotInDest = sourceRsChunk.filter( (rec) => !match[ rec[keyFieldSource] ] );
        notInDest = sourceRsChunkNotInDest.length > 0 ? Object.fromEntries( 
            sourceRsChunkNotInDest.map( (rec) => ([ rec[keyFieldDest], rec ]) ) ) : {};


        return {
            notInSource: {...accumulator.notInSource, ...notInSource},
            notInDest: {...accumulator.notInDest, ...notInDest},
            ...result,
            sourceEnd: sourceRsChunk.length < sourcePageSize
        }
    },

    
    async compare( sourceQuery, destQuery, parameters, chunkLimit = 1 ) {
        let result = { 
            notInSource: {},
            notInDest: {},
            match: {},
            sourceEnd: false
        }
        let keyFieldDest = parameters.keyFieldD || "id";

        for( let chunk = 0; chunk < chunkLimit && !result.sourceEnd; chunk++ ) {
            result = await this.compareChunk( 
                result, sourceQuery, destQuery, parameters, chunk );
        }

        // tries to find records in destination but not in source
        let destToDeleteQuery = destQuery.clone();
        destToDeleteQuery.page(null, 10000);
        // finds all destination records which have the key field
        let destToDeleteRs = await destToDeleteQuery
            // .where( destToDeleteQuery[keyFieldDest].greaterThan( keyToFind[0] ) )
            // .andWhere( destToDeleteQuery[keyFieldDest].lessThan( keyToFind[keyToFind.length-1] ) )
            .andWhere( destToDeleteQuery[keyFieldDest].notIn( Object.keys( result.matches ) ) )
            .exec();
        notInSource = destToDeleteRs.length > 0 ? Object.fromEntries( 
            destToDeleteRs.map( (rec) => ([ rec[keyFieldDest], rec ]) ) ) : {};

        
        if ( result.duplicateKeys.length > 0 ) {
            console.warn( `Destination keys duplicates: (${result.duplicateKeys.length})` );
            console.warn( result.duplicateKeys );
        }

        return result;
    },

    async diff( sourceRs, destRs, parameters, chunk = 0 ) {
        let comparison = this.compare( sourceRs, destRs, parameters, chunk );

        return comparison;
    }
}

exports.CompareHelper = CompareHelper;
