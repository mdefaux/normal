

const CompareHelper = {

    /**
     * 
     * @param {*} sourceRec 
     * @param {*} destRec 
     * @returns false if there are no difference between source and destination records
     *      an object with:
     *      {
     *          id:  the record id
                newValues: {...accumulator.newValues, [colName]: newValue},
                oldValues: {...accumulator.oldValues, [colName]: destValue},
                differentColumns: [ <array of column names that differs> ]
     *      }
     */
    compareColumns( sourceRec, destRec, parameters, entityDest ) {

        let modSourceRec = sourceRec;

        // translate sourceRec for later comparison
        if(parameters.columnMap) modSourceRec = parameters.columnMap(sourceRec,destRec)
        

        // compare values for every column
        let response = Object.entries(modSourceRec).reduce((accumulator, [colName, value]) => {
            let destValue = destRec[colName];
            // let eq = value === destValue;
            let destField = entityDest.metaData.model.fields[colName];
            let eq = false;
            let newValue = value;

            // columnMap could pass a function in a field. This function should already compare the two records.
            // the result includes the equals result (true/false) and the new value
            if(typeof value === 'function') {
                let columnFunctionResult = value(sourceRec, destRec);
                eq = columnFunctionResult.eq;
                if(!eq) newValue = columnFunctionResult.value;
            }
            else eq = destField.equalValues(value, destValue);

            if(!eq) {
                return {
                    id: destRec.id,
                    //...accumulator, 
                    newValues: {...accumulator.newValues, [colName]: newValue},
                    oldValues: {...accumulator.oldValues, [colName]: destValue},
                    differentColumns: [...accumulator.differentColumns, colName]
                }
            }   

            return accumulator
         
        }, {id: null,  newValues: {}, oldValues: {}, differentColumns: []  });


       // return differentColumns.length === 0 ? false : {
        return response.differentColumns.length === 0 ? false : response;
    },
    

    async compareChunk( accumulator, sourceQuery, destQuery, parameters, chunk = 0 ) {
        let notInDest = {};
        let match = {};

        let sourcePageSize = parameters.sourcePageSize || 500;
        let keyFieldSource = parameters.keyFieldS || "id";
        let keyFieldDest = parameters.keyFieldD || "id";
        let destEntity = destQuery.entity;

        // sets the chunk dimension to the query
        sourceQuery.page( chunk+1, sourcePageSize );
       // sourceQuery.debug();
        // queries the source
        let sourceRsChunk = await sourceQuery.exec();

        // extracts keys from result
        let keyToFind = sourceRsChunk
            .map( (rec) => rec[keyFieldSource] )
            .sort();

        // fromEntries per creare un oggetto chiave (id), valore (record)
        let recordToFind = Object.fromEntries(sourceRsChunk.map( (rec) => ([ rec[keyFieldSource], rec ])));

        let destMatchQuery = destQuery.clone();
        destMatchQuery.page(null, 10000);
        // finds all destination records that match with source
        let destRs = await destMatchQuery.where( destEntity[keyFieldDest].in( keyToFind ) ).exec();

        if ( destRs.length > sourceRsChunk.length ) {
            // TODO: handle this case
            // console.warn( `Destination records (${destRs.length}) greater than source records (${sourceRsChunk.length})` );
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
            // compares two mathing record with same key
            let columnDiff = this.compareColumns( recordToFind[destRec[keyFieldDest]], destRec, parameters, destEntity );

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
            parameters.columnMap(rec,match[ rec[keyFieldDest] ]) ]) ) ) : {}; // I call the columnMap because for Backlog it expects dest but in this case you don't need to pass it to it.

        // returns new accumulator with result for this chunk
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
            // .debug()
            .exec();
        notInSource = destToDeleteRs.length > 0 ? Object.fromEntries( 
            destToDeleteRs.map( (rec) => ([ rec[keyFieldDest], rec ]) ) ) : {};

        result.notInSource = notInSource;

        // performs a specific action for records not presentin source
        if ( actions?.handleNotInSource ) {
            result = await actions?.handleNotInSource( result, parameters );
        }

        result.matchCount = Object.keys( result.match ).length;
        result.notInDestCount = Object.keys( result.notInDest ).length;
        result.notInSourceCount = destToDeleteRs.length;
        
        if ( typeof parameters.log === 'function' ) {
            parameters.log( `Updated: ${result.updated||0}, Inserted: ${result.inserted||0}, Deleted: ${result.deleted||0}, Duplicated: ${result.duplicateKeys.length}` );

            if ( result.duplicateKeys.length > 0 ) {
                parameters.log( `Destination keys duplicates: (${result.duplicateKeys.length})` );
                parameters.log( result.duplicateKeys );
            }
        }

        delete result.destEntity;
    
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
            insertedKeys: [...result.insertedKeys || [], ...Object.keys( result.notInDest )],
            inserted: (result.inserted || 0) + toInsert.length,
            notInDest: {}
        };
    },

    async removeFromDestination( result, parameters ) {

        let toDelete = Object.entries( result.notInSource )
            .map( ([,rec]) => (rec) );

        if ( toDelete.length === 0 ) {
            return result;
        }

        if(parameters.removed != undefined )
        {
            //aspetta che tutti gli update siano stati fatti effettivamente
           await Promise.all(toDelete.map(r=> result.destEntity.update(r[result.destEntity.metaData.model.idField], parameters.removed)));

        }  

        if(!parameters.noDelete) await result.destEntity.delete( toDelete );

        return {
            ...result,
            deletedKeys: Object.keys( result.notInSource ),
            deleted: (result.deleted || 0) + toDelete.length,
            notInSource: {}
        };
    },

    async updateDestination( result ) {

        let toUpdate = Object.entries( result.diff || {} )
            .map( ([,e]) => (e) );

        if ( toUpdate.length === 0 ) {
            return result;
        }

        for ( let entryToUpdate of toUpdate ){
            await result.destEntity.update( entryToUpdate.id, entryToUpdate.newValues );
        }

        return {
            ...result,
            updatedKeys: [...result.updatedKeys || [], ...Object.keys( result.diff )],
            updated: (result.updated || 0) + toUpdate.length,
            wasDiff: {...result.wasDiff||{}, ...result.diff },
            diff: {}
        };
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
