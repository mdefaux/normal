
 const assert = require( "assert" );
const {IAlignBuffer} = require("./IAlignBuffer");
const ThresholdBuffer = require("./ThresholdBuffer");
const {ILogger} = require("./ILogger");

class ComparisonResult {
    constructor () {
        this.notInSource= {},
        this.notInDest= {},
        this.match= {},
        this.diff= {},
        this.duplicateKeys= [],
        // this.destEntity= destQuery.entity,
        this.sourceEnd= false
    }
}
const defaultPageSize=500;
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

        // requires destination entity has fields metadata
        assert( entityDest?.metaData?.model?.fields );

        let modSourceRec = sourceRec;

        // translate sourceRec for later comparison
        if (parameters.columnMap) {
            modSourceRec = parameters.columnMap(sourceRec, destRec);
        }

        // compare values for every column
        let response = Object.entries(modSourceRec).reduce((accumulator, [colName, value]) => {
            let destValue = destRec[colName];
            // Gets the destination field from destination entity and checks if exhists
            let destField = entityDest.metaData.model.fields[colName];
            if ( !destField ) {
                throw new Error( `Column '${colName}' not found in entity '${entityDest.metaData}'. Column map function: ${parameters.columnMap}` )
            }
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
                    id: destRec.id, // TODO: change in id column from keyField
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

    
    async compareSet( sourceQuery, destQuery, parameters, chunkLimit = 1, actions = {} ) {
        // let result = { 
        //     notInSource: {},
        //     notInDest: {},
        //     match: {},
        //     diff: {},
        //     duplicateKeys: [],
        //     destEntity: destQuery.entity,
        //     sourceEnd: false
        // }
        let result = new ComparisonResult();
        const destEntity= destQuery.entity;
        let keyFieldDest = parameters.keyFieldD || "id";

        for( let chunk = 0; chunk < (chunkLimit||10000) && !result.sourceEnd; chunk++ ) {
            result = await this.compareChunk( 
                result, sourceQuery, destQuery, parameters, chunk );
            
            // performs a specific action for records not present in destination
            if ( actions?.handleNotInDestination ) {
                result = await actions.handleNotInDestination( destEntity, result );
            }
            // performs a specific action for records which have same key 
            // but column value different
            if ( actions?.handleValueDifferent ) {
                result = await actions.handleValueDifferent( destEntity, result );
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
            result = await actions?.handleNotInSource( destEntity, result, parameters );
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

        // delete result.destEntity;
    
        return result;
    },

    /**
     * 
     * @param {*} sourceQuery 
     * @param {*} destQuery 
     * @param {Object} parameters 
     * @param {long} iterationLimit sets a limit to iteration, if undefined continue to 1000000
     * @param {IAlignBuffer} buffer 
     * @returns 
     */
    async compareSorted( sourceQuery, destQuery, parameters, iterationLimit = 1000000, buffer = new IAlignBuffer(), logger = new ILogger(), ) {
        assert(destQuery);
        // assert( !(buffer instanceof IAlignBuffer) );
        if ( !(buffer instanceof IAlignBuffer) ) {
            throw new Error( `buffer parameter should be of type IAlignBuffer`);
        }
        
        let result = new ComparisonResult();
        const sourcePageSize = parameters.sourcePageSize || defaultPageSize;
        const destPageSize = parameters.destPageSize || defaultPageSize;
        const destEntity= destQuery.entity;
        const keyFieldDest = parameters.keyFieldD || "id";        
        const keyFieldSource = parameters.keyFieldS || "id";
        //initial page for the source
        let pageSourceIndex=1; 
        //initial offset for the destination. 
        //offset is used for destination instead of pagination because insertion and deletion can change data interval 
        // offset is now moved in buffer class (ThresholdBuffer)
        //let offsetDest=0;       
        
        // let offsetend=0;

        // dest page fetching
        let pageDestIndex = 0;
        // let insertSize = parameters.insertSize || 500; 
        //inizialized for the count of the source number of data
        // let sourceRecordCount=sourcePageSize;
        //let endfor=false;
        //let alreadyMatched= null;
        // indicates when it is at the end of the destination or the source
        let arraySourceEnd=false; 
        let arrayDestEnd=false; 

        // indexes to cycle source and dest array
        let iSource = 0;
        let iDest = 0;

        sourceQuery.pageSize(sourcePageSize);

        //  let destination = destQuery
        destQuery
            .pageSize( destPageSize )
            .orderBy({ columnName: keyFieldDest, order: "asc" }); 
            //un domani la orderby potrebbe avere una funzione che la rende più complessa per i casi particolari
            //es. se devo definire una chive a cui sostituisco i numeri con le lettere ecc

        let sourceArray = [];
        let destArray = [];

        // infinite loop; exit if comparing more than 1M records.
        for( let iteration = 0; iteration < (iterationLimit) && !result.sourceEnd; iteration++ ) {
            // check if fetch is needed
            if (iSource >= sourceArray.length && !arraySourceEnd ) {
                let dateSource = Date.now();
                logger.info(`SourcePage: ${pageSourceIndex}`);
                sourceArray = await sourceQuery.page(pageSourceIndex++).exec();
                
                let getSourceTime = (Date.now() - dateSource)/ 1000;
                logger.info(`Retrieved data in ${getSourceTime}`);
                iSource = 0;

                // TODO: eventually update count of total records.

                if(sourceArray.length === 0) {
                    arraySourceEnd = true;
                    // break;
                }
            }

            if (iDest >= destArray.length && !arrayDestEnd ) {

                // add an offset if insert/delete are executed before fetching data
                let offset = (pageDestIndex++*destPageSize) + buffer.getOffset() ;
                destQuery.setRange(destPageSize, offset);
                destArray = await destQuery.exec();
                iDest = 0;

                if(destArray.length === 0) {
                    arrayDestEnd = true;
                    // break;
                }
            }

            // exit if both arrays have no more records. 
            if(arraySourceEnd  && arrayDestEnd) {
                break;
            }


            // check if actual uniqueKey is the same as the last one.
            // if a duplicate is met, skip it
            let lastUniqueKey = buffer.getLastUniqueKey();
            let sourceArrayKey = sourceArray[iSource]?    sourceArray[iSource][keyFieldSource] : null;
            let isDuplicate = lastUniqueKey === sourceArrayKey;

            // set lastUniqueKey in any case
            if(sourceArrayKey) {
                buffer.setLastUniqueKey(sourceArrayKey);
            }
            

            // if uniqueKey is duplicate, log and skip this source record.
            // check if: isDuplicate && !arraySourceEnd && iSource attuale !== iSource precedente
/*             if(isDuplicate) {
                // log. Use Logger?
                console.log(`Duplicate on uniqueKey found: ${lastUniqueKey}`);
                //logger.info(`Duplicate on uniqueKey found: ${lastUniqueKey}`);
                iSource++;
                continue;

            } */
           
            // TODO: check if source and destination have different rules for ordering.
            // for example: check first X records from source and destination and check the keys, maybe one starts with capital letters and the other with numbers.

            
            // compare function can be passed as parameter.
            let compareFunction = parameters.compareFunction || CompareHelper.compareKeys ;
            
            let compareResult = iSource < sourceArray.length &&
                iDest < destArray.length &&
                compareFunction(sourceArray[iSource], destArray[iDest], keyFieldSource, keyFieldDest );
                //sourceArray[iSource][keyFieldSource] === destArray[iDest][keyFieldDest];
          
            

            // "UPDATE"
            if( compareResult === 0 ) {

                // same key; check if the record is the same column per column
                let differentColumns = CompareHelper.compareColumns( sourceArray[iSource], destArray[iDest], parameters, destQuery.entity );

                
                // if at least one columns is different, call a function with await (will save an array buffer of records to update and execute it when a certain threshold is met)
                if(differentColumns) {
                    try {
                        await buffer.update(destQuery.entity, differentColumns.newValues, differentColumns.id);
                    } catch(e) {
                      logger.error(e);  
                    }
                    
                }
                

                iSource++;
                iDest++;
            }
            // "DELETE"
            else if(iSource > sourceArray.length || arraySourceEnd || compareResult > 0) {

                // all records in destination from here on are not in source and can be deleted
                // call a function with await (will save an array buffer of records to delete and execute it when a certain threshold is met)
                try {
                    await buffer.delete(destQuery.entity, destArray[iDest]);
                }
                catch(e){
                    logger.error(e);
                }
                

                iDest++;
            }
            // "INSERT"
            else if(iDest > destArray.length || arrayDestEnd || compareResult < 0) {

                // all records in source from here on are not in destination and can be inserted
                // call a function with await (will save an array buffer of records to insert and execute it when a certain threshold is met)
                try {
                    await buffer.insert(destQuery.entity, typeof parameters.columnMap === 'function' ? parameters.columnMap(sourceArray[iSource]) : sourceArray[iSource]);
                }
                catch(e){
                    logger.error(e);
                }
                
                

                iSource++;
            }

           
        
        }


        try {
            await buffer.flush( destQuery.entity );
        }
        catch(e){
            logger.error(e);
        }
        
        result.buffer = buffer;
        return result;
    },

    compareKeys(a, b, keyFieldA, keyFieldB) {
        assert(a);
        assert(b);
        assert(keyFieldA);
        assert(keyFieldB);


        if(a[keyFieldA] < b[keyFieldB] ) {
            return -1;
        } else if (a[keyFieldA] > b[keyFieldB]) {
            return 1;
        }
        return 0;
    },
    

    async diff( sourceRs, destRs, parameters, chunk = 0 ) {
        let comparison = this.compareSet( sourceRs, destRs, parameters, chunk );

        return comparison;
    },

    async insertInDestination( destEntity, result ) {
        let toInsert = Object.entries( result.notInDest )
            .map( ([,rec]) => (rec) );

        if ( toInsert.length === 0 ) {
            return result;
        }

        await destEntity.insert( toInsert );

        return {
            ...result,
            insertedKeys: [...result.insertedKeys || [], ...Object.keys( result.notInDest )],
            inserted: (result.inserted || 0) + toInsert.length,
            notInDest: {}
        };
    },

    async removeFromDestination( destEntity, result, parameters ) {

        let toDelete = Object.entries( result.notInSource )
            .map( ([,rec]) => (rec) );

        if ( toDelete.length === 0 ) {
            return result;
        }

        if(parameters.removed != undefined )
        {
            //aspetta che tutti gli update siano stati fatti effettivamente
           await Promise.all(toDelete.map(r=> destEntity.update(r[destEntity.metaData.model.idField], parameters.removed)));

        }  

        if(!parameters.noDelete) await destEntity.delete( toDelete );

        return {
            ...result,
            deletedKeys: Object.keys( result.notInSource ),
            deleted: (result.deleted || 0) + toDelete.length,
            notInSource: {}
        };
    },

    async updateDestination( destEntity, result ) {

        let toUpdate = Object.entries( result.diff || {} )
            .map( ([,e]) => (e) );

        if ( toUpdate.length === 0 ) {
            return result;
        }

        for ( let entryToUpdate of toUpdate ){
            await destEntity.update( entryToUpdate.id, entryToUpdate.newValues );
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

        return await this.compareSet( sourceQuery, destQuery, parameters, false, {
            handleNotInDestination: CompareHelper.insertInDestination,
            handleNotInSource: CompareHelper.removeFromDestination,
            handleValueDifferent: CompareHelper.updateDestination,
        } );
    },

    async alignSorted( sourceQuery, destQuery, parameters, buffer= new ThresholdBuffer, logger ) {

        return await this.compareSorted( sourceQuery, destQuery, 
            parameters, 
            parameters.maxIteration, 
            buffer,
            logger
            // {
            //     // change default functions with new functions
            //     handleNotInDestination: parameters.handleNotInDestination || buffer?.insert, //   CompareHelper.insertInDestination,
            //     handleNotInSource: parameters.handleNotInSource || buffer?.delete, // CompareHelper.removeFromDestination,
            //     handleValueDifferent: parameters.handleValueDifferent || buffer?.update, //  CompareHelper.updateDestination,
            // } 
        );
    }

}

exports.CompareHelper = CompareHelper;
