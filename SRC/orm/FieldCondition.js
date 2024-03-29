const { FieldConditionDef } = require( "./FieldConditionDef" );
const assert = require('assert');

class include extends FieldConditionDef {

    constructor () {
        super( 'in', undefined, undefined, undefined, undefined ) ;
    }

    toQueryString ( column, filterValues ) {
        return filterValues.map( (value) => { 
            let entry = column.writeEntry( value );
            let urlFilterValue = entry[1] && entry[1].replace ? entry[1].replace('&','%26') : entry[1];
            return `i${entry[0]}[]=${ urlFilterValue }`;
        } ).join( '&' );
    }
    match( record ) {
        let value = record[ this.columnName ];
        return ( this.value.find( (f) => ( value === f ) ) );
        // return ( this.value.find( (f) => ( this.props.column.equals( value, f ) ) ) )
        // ( filterValues.indexOf( value ) > -1 )
    }
    parseQueryString( reqField, reqValue ) {
        this.columnName= reqField.substring(1);

        assert( Array.isArray( reqValue ) );
        this.value= reqValue;
        return this;
    }
};

class textMatch extends FieldConditionDef {

    constructor () {
        super( 'like', undefined, undefined, undefined, undefined ) ;
    }
    // name: "textMatch",
    // label: "Contiene stringa",
    // description: "string value contains the filter string",
    toQueryString( column, value ) {
        // let entry = column.writeEntry( value );
        // return `c${entry[0]}[]=${ entry[1] }`;
        let urlFilterValue = value.replace ? value.replace('&','%26') : value;
        return `c${column.getSourceName()}[]=${urlFilterValue}`;
    }

    match( record ) {
        let value = record[ this.columnName ];
        let searchString = this.value;
        if ( !searchString ) { // is searchString is null, test pass
            return true;
        }
        // escapes search string and prevents regex special char to crash evaluation
        // https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
        if( searchString && searchString.replace )
            searchString = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string              
        // checks if value matches with filter search text
        const regExp = new RegExp(searchString || '.*', 'i');   // is searchString is null, test pass
        // return !! regExp.exec( this.column.toString( value ) );   // converts to string then test regex and converts to boolean with !!
        return !! regExp.exec( value );   // converts to string then test regex and converts to boolean with !!
    }
    
    sqlValue(query) {
        if (typeof this.value === 'object') {
            if (this.value instanceof Query) {
                return this.value.qb;
            }
            // else if (this.value instanceof Field) {
            else if (this.value && this.value.sqlSource) {
                return this.value.sqlSource;
            }
        }
        return `%${this.value}%`;
    }
}


const FieldCondition = {

    in: include,

    notIn: class extends FieldConditionDef {

        constructor () {
            super( 'not in', undefined, undefined, undefined, undefined ) ;
        }
    
        toQueryString ( column, filterValues ) {
            return filterValues.map( (value) => { 
                let entry = column.writeEntry( value );
                let urlFilterValue = entry[1] && entry[1].replace ? entry[1].replace('&','%26') : entry[1];
                return `n${entry[0]}[]=${ urlFilterValue }`;
            } ).join( '&' );
        }
        match( record ) {
            let value = record[ this.columnName ];
            return ( this.value.find( (f) => ( value === f ) ) );
            // return ( this.value.find( (f) => ( this.props.column.equals( value, f ) ) ) )
            // ( filterValues.indexOf( value ) > -1 )
        }
        parseQueryString( reqField, reqValue ) {
            this.columnName= reqField.substring(1);
    
            assert( Array.isArray( reqValue ) );
            this.value= reqValue;
            return this;
        }
    },


    // {
    //     name: "notIn",
    //     label: "non in questi valori",
    //     description: "value is contained IN a set of specified values",
    //     toQueryString: function( column, filterValues )
    //         {
    //             return filterValues.map( (value) => { 
    //                 let entry = column.writeEntry( value );
    //                 let urlFilterValue =entry[1] && entry[1].replace ? entry[1].replace('&','%26') : entry[1];
    //                 return `n${entry[0]}[]=${ urlFilterValue }`;
    //             } ).join( '&' );
    //         },
    //     match: ( value, filterValues ) =>
    //         ( filterValues.indexOf( value ) === -1 )
    // },

    endsWith:
    {
        name: "endsWith",
        label: "finisce con",
        description: "value is contained IN a set of specified values",
        toQueryString: function( column, filterValues )
            {
                return filterValues.map( (value) => { 
                    let entry = column.writeEntry( value );
                    return `e${entry[0]}[]=${ entry[1] }`;
                } ).join( '&' );
            },
        match: function ( value, filterValues ) 
        {
            return ( value.endsWith( this.value ) )
        }
    },

    textMatch: textMatch,
    // {
    //     name: "textMatch",
    //     label: "Contiene stringa",
    //     description: "string value contains the filter string",
    //     toQueryString: function( column, value )
    //         {
    //             // let entry = column.writeEntry( value );
    //             // return `c${entry[0]}[]=${ entry[1] }`;
    //             let urlFilterValue = value.replace ? value.replace('&','%26') : value;
    //             return `c${column.getSourceName()}[]=${urlFilterValue}`;
    //         },
    //     match: function ( value ) //, searchString )
    //         {  
    //             let searchString = this.value;
    //             // escapes search string and prevents regex special char to crash evaluation
    //             // https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
    //             if( searchString && searchString.replace )
    //                 searchString = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string              
    //             // checks if value matches with filter search text
    //             const regExp = new RegExp(searchString || '.*', 'i');   // is searchString is null, test pass
    //             return !! regExp.exec( this.column.toString( value ) );   // converts to string then test regex and converts to boolean with !!
    //         }
    // },

    less: class extends FieldConditionDef {

        constructor () {
            super( '<', undefined, undefined, undefined, undefined ) ;
        }
    
        toQueryString ( column, value )
        {
            return `l${column.getSourceName()}[]=${column.toQueryString(value)}`;
        }

        match ( value ) { 
            return ( this.column.compare( value, this.value ) < 0 ) 
        } // value <= compare )( value, compare ) => ( value < compare )
    },

    lessOrEqual: class extends FieldConditionDef {

        constructor () {
            super( '<=', undefined, undefined, undefined, undefined ) ;
        }
    
        toQueryString( column, value ) {
            return `s${column.getSourceName()}[]=${column.toQueryString(value)}`;
        }

        match ( value ) { 
            return ( this.column.compare( value, this.value ) <= 0 ) 
        } // value <= compare )
    },

    greater: class extends FieldConditionDef {

        constructor () {
            super( '>', undefined, undefined, undefined, undefined ) ;
        }
    
        toQueryString( column, value )
        {
            return `g${column.getSourceName()}[]=${column.toQueryString(value)}`;
        }

        match ( value ) { 
            return ( this.column.compare( value, this.value ) > 0 ) 
        }
    },
    
    greaterOrEqual:   class extends FieldConditionDef {

        constructor () {
            super( '>=', undefined, undefined, undefined, undefined ) ;
        }
    
        toQueryString( column, value )
        {
            return `r${column.getSourceName()}[]=${column.toQueryString(value)}`;
        }

        match ( value ) { 
            return ( this.column.compare( value, this.value ) >= 0 ) 
        }
    },
}

module.exports = FieldCondition;
