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

    parse( req, responseModel, relation ) {
        let filters = this.parseFilter( req, responseModel, relation );
        let selectedFields = false;
        let groupedFields = false;

        return {filters, selectedFields, groupedFields};
    }
};

module.exports.URLquery = URLquery;
