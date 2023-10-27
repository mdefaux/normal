

const CompareHelper = {

    /**
     * 
     * @param {*} sourceRec 
     * @param {*} destRec 
     * @returns 
     */
    compareColumns( sourceRec, destRec, parameters, entityDest ) {
        // TODO
       // let differentColmns = [];

        let modSourceRec = sourceRec;

        // translate sourceRec for later comparison
        if(parameters.columnMap) modSourceRec = parameters.columnMap(sourceRec)
        

        // compare values for every column
        let response = Object.entries(modSourceRec).reduce((accumulator, [colName, value]) => {
            let destValue = destRec[colName];
            // let eq = value === destValue;
             let eq = entityDest.metaData.model.fields[colName].equalValues(value, destValue);

            if(!eq) {
                return {
                    id: destRec.id,
                    //...accumulator, 
                    newValues: {...accumulator.newValues, [colName]: value},
                    oldValues: {...accumulator.oldValues, [colName]: destValue},
                    differentColmns: [...accumulator.differentColmns, colName]
                }
            }   

            return accumulator
         
        }, {id: null,  newValues: {}, oldValues: {}, differentColmns: []  });


       // return differentColmns.length === 0 ? false : {
        return response.differentColmns.length === 0 ? false : response;
         /* {
            id: sourceRec.id,
            newValues: {},
            oldValues: {}
        } */
    },
    

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
        // queries the source
        let sourceRsChunk = await sourceQuery.exec();

        // extracts keys from result
        let keyToFind = sourceRsChunk
            .map( (rec) => rec[keyFieldSource] )
            .sort();

        // fromEntries per creare un oggetto chiave (id), valore (record)
        let recordToFind = Object.fromEntries(sourceRsChunk.map( (rec) => ([ rec[keyFieldSource], rec ])));

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

        // adds destination records that match in 'match' key/value map
        let result = destRs.reduce( ( acc, destRec ) => {

            // checks if already present in match map
            if ( acc.match[ destRec[keyFieldDest] ] ) {
                // adds record to "duplicate keys" array
                return { 
                    match: acc.match, 
                    duplicateKeys: [...acc.duplicateKeys, destRec[keyFieldDest] ] 
                }
            }
            // TODO: compares two mathing record with same key
           // let columnDiff = false; // this.compareColumns( sourceRec, destRec, parameters );
            let columnDiff = this.compareColumns( recordToFind[destRec[keyFieldDest]], destRec, parameters, destEntity );
           // let columnDiff = this.compareColumns( sourceRec, destRec, parameters );
            // adds record to 'match' key/value map
            return { 
                diff: columnDiff ? {...acc.diff, [destRec[keyFieldDest]]: columnDiff } : acc.diff,
                match: {...acc.match, [destRec[keyFieldDest]]: destRec }, 
                duplicateKeys: acc.duplicateKeys 
            }
        }, { match: accumulator.match || {}, duplicateKeys: accumulator.duplicateKeys || [] } );

        // builds a map with the result

        match = result.match;
        
        // match = Object.fromEntries(destRs.map( (rec) => ([ rec[keyFieldSource], rec ]) ));

        // let notInSourceRS = await destRs.where( this[keyFieldDest].notIn( keyToFind ) ).exec();
        // notInSource = Object.fromEntries(arrayB.map( (rec) => ([ rec[keyFieldSource], rec ]) ));

        // 
        let sourceRsChunkNotInDest = sourceRsChunk.filter( (rec) => !match[ rec[keyFieldSource] ] );
        notInDest = sourceRsChunkNotInDest.length > 0 ? Object.fromEntries( 
            sourceRsChunkNotInDest.map( (rec) => ([ rec[keyFieldDest], 
            parameters.columnMap(rec) ]) ) ) : {};


        return {
            ...accumulator,
            // notInSource: {...accumulator.notInSource, ...notInSource},
            notInDest: {...accumulator.notInDest, ...notInDest},
            ...result,
            sourceEnd: sourceRsChunk.length < sourcePageSize
        }
    },

    
    async compare( sourceQuery, destQuery, parameters, chunkLimit = 1, actions = {} ) {
        let result = { 
            notInSource: {},
            notInDest: {},
            match: {},
            diff: {},
            duplicateKeys: [],
            destEntity: destQuery.entity,
            sourceEnd: false
        }
        let keyFieldDest = parameters.keyFieldD || "id";

        for( let chunk = 0; chunk < (chunkLimit||10000) && !result.sourceEnd; chunk++ ) {
            result = await this.compareChunk( 
                result, sourceQuery, destQuery, parameters, chunk );
            
            // performs a specific action for records not present in destination
            if ( actions?.handleNotInDestination ) {
                result = await actions.handleNotInDestination( result );
            }
            // performs a specific action for records which have same key 
            // but column value different
            if ( actions?.handleValueDifferent ) {
                result = await actions.handleValueDifferent( result );
            }
        }

        // tries to find records in destination but not in source
        let destToDeleteQuery = destQuery.clone();
        destToDeleteQuery.page(null, 10000);
        // finds all destination records which have the key field
        let destToDeleteRs = await destToDeleteQuery
            // .where( destToDeleteQuery[keyFieldDest].greaterThan( keyToFind[0] ) )
            // .andWhere( destToDeleteQuery[keyFieldDest].lessThan( keyToFind[keyToFind.length-1] ) )
            .andWhere( destToDeleteQuery[keyFieldDest].notIn( Object.keys( result.match ) ) )
            .andWhere( result.insertedKeys?.length > 0 && destToDeleteQuery[keyFieldDest].notIn( result.insertedKeys ) )
            .debug()
            .exec();
        notInSource = destToDeleteRs.length > 0 ? Object.fromEntries( 
            destToDeleteRs.map( (rec) => ([ rec[keyFieldDest], rec ]) ) ) : {};

        result.notInSource = notInSource;

        // performs a specific action for records not presentin source
        if ( actions?.handleNotInSource ) {
            result = await actions?.handleNotInSource( result );
        }

        result.matchCount = Object.keys( result.match ).length;
        result.notInDestCount = Object.keys( result.notInDest ).length;
        result.notInSourceCount = destToDeleteRs.length;
        
        if ( result.duplicateKeys.length > 0 ) {
            console.warn( `Destination keys duplicates: (${result.duplicateKeys.length})` );
            console.warn( result.duplicateKeys );
        }

        return result;
    },

    async diff( sourceRs, destRs, parameters, chunk = 0 ) {
        let comparison = this.compare( sourceRs, destRs, parameters, chunk );

        return comparison;
    },

    async insertInDestination( result ) {
        let toInsert = Object.entries( result.notInDest )
            .map( ([,rec]) => (rec) );

        if ( toInsert.length === 0 ) {
            return result;
        }

        await result.destEntity.insert( toInsert );

        return {
            ...result,
            insertedKeys: [...insertedKeys || [], ...Object.keys( result.notInDest )],
            inserted: (result.inserted || 0) + toInsert.length,
            notInDest: {}
        };
    },

    async removeFromDestination( result ) {

        let toDelete = Object.entries( result.notInSource )
            .map( ([,rec]) => (rec) );

        if ( toDelete.length === 0 ) {
            return result;
        }

        await result.destEntity.delete( toDelete );

        return {
            ...result,
            deletedKeys: Object.keys( result.notInSource ),
            deleted: (result.deleted || 0) + toDelete.length,
            notInSource: {}
        };
    },

    async updateDestination( result ) {

        return result;
    },

    async align( sourceQuery, destQuery, parameters ) {

        return await this.compare( sourceQuery, destQuery, parameters, false, {
            handleNotInDestination: CompareHelper.insertInDestination,
            handleNotInSource: CompareHelper.removeFromDestination,
            handleValueDifferent: CompareHelper.updateDestination,
        } );
    }

}

exports.CompareHelper = CompareHelper;
