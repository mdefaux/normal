const { FieldAggregationCount } = require("./orm/FieldAggregation");
const FieldCondition = require("./orm/FieldCondition");

const URLquery = {

    parseFilter( req, responseModel, relation ) {

        return Object.entries( req ).reduce( (filters, [reqField, reqValue]) => {
            let newCondition;
            if ( reqField.startsWith( "i" ) ) {
                newCondition = new FieldCondition.in();
            }
            else if ( reqField.startsWith( "c" ) ) {
                newCondition = new FieldCondition.textMatch();
            }
            else {
                return filters;
            }

            return [...filters, newCondition.parseQueryString( reqField, reqValue ) ];

        }, [] );
    },

    parseSelect( req, responseModel, relation ) {

        return Object.entries( req ).reduce( (selectedColumns, [reqField, reqValue]) => {
            let newColumnSelected;
            if ( reqField.startsWith( "xcount" ) ) {
                newColumnSelected = new FieldAggregationCount();
            }
            // else if ( reqField.startsWith( "xsel" ) ) {
            //     newColumnSelected = new FieldCondition.textMatch();
            // }
            else {
                return selectedColumns;
            }

            return [...selectedColumns, newColumnSelected ];

        }, [] );
    },

    parse( req, responseModel, relation ) {
        let filters = this.parseFilter( req, responseModel, relation );
        let selectedFields = URLquery.parseSelect( req, responseModel, relation );
        let groupedFields = false;

        return {filters, selectedFields, groupedFields};
    }
};

module.exports.URLquery = URLquery;
