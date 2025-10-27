/** * Utility functions for string similarity and matching.
 * 
 */
const Utility = {


    /** * Compares two strings and returns a similarity score based on the number of matching characters.
     * 
     * @param {*} strA 
     * @param {*} strB 
     * @returns 
     */
    soundsLike( strA, strB ) {

        if ( strA === strB ) {
            return 0;
        }
        if ( strA.toUpperCase() ===  strB.toUpperCase() ) {
            return 1;
        }
        
        strA = strA.toUpperCase().split('').sort();
        strB = strB.toUpperCase().split('').sort();
        
        let point = 2;
        let match = 0;
        let indA = 0; 
        let indB = 0;

        while( indA < strA.length && indB < strB.length ) {

            // found a match: advances both indexes
            if( strA[ indA ] === strB[ indB ] ) {
                match ++;
                point -= 1; // match;
                indA ++;
                indB ++;
            } else if( strA[ indA ] < strB[ indB ] ) {
                point+=2;
                indA ++;
            } else if( strA[ indA ] > strB[ indB ] ) {
                point+=2;
                indB ++;
            }
        }
        
        // A-index exceeded string len: advance B-index
        if( indA >= strA.length ) {
            point += strB.length-indB;
        }
        // B-index exceeded string len: advance A-index
        else if( indB >= strB.length ) {
            point += strA.length-indA;
            // point ++;
            // indA ++;
            // continue;
        }
        return Math.max( point, 2 );
    },

    mapSimilarity( str, arrayOfStr ) {

        return arrayOfStr.map( (strB) => (
            [ strB, this.soundsLike( str, strB ) ]
        ) ).sort( (a, b) => a[1]-b[1] );
    },

    top3Similar( str, arrayOfStr ) {

        return this.mapSimilarity( str, arrayOfStr )
            .filter( (e) => e[1] < 10 )
            .sort( (a, b) => a[1]-b[1] )
            .map( (e) => e[0] )
            .slice( 0, 3 );
    }
}

exports.Utility = Utility;