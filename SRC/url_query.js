const { FieldAggregationCount, /* FieldAggregationGroupBy */ } = require("./orm/FieldAggregation");
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

        let groupBySelect = [];
        

        let select = Object.entries( req ).reduce( (selectedColumns, [reqField, reqValue]) => {
            let newColumnSelected;
            if ( reqField.startsWith( "xcount" ) ) {
                newColumnSelected = new FieldAggregationCount();
            }
            // else if ( reqField.startsWith( "xsel" ) ) {
            //     newColumnSelected = new FieldCondition.textMatch();
            // }
/*             else if (reqField.startsWith( "xgb" ) ) {
                groupBySelect.push(reqValue);
                return selectedColumns;
            } */
            else {
                return selectedColumns;
            }

          return [...selectedColumns, newColumnSelected ];

        }, [] );

        if(groupBySelect.length > 0) return groupBySelect;
        return select;
    },

    parseGroup( req, responseModel, relation ) {

   /*      return Object.entries( req ).reduce( (selectedColumns, [reqField, reqValue]) => {
            let GroupByFields = [];
            let newColumnGroupBy;
            if ( reqField.startsWith( "xgb" ) ) {
                newColumnGroupBy = new FieldAggregationGroupBy();
            }
            // else if ( reqField.startsWith( "xsel" ) ) {
            //     newColumnSelected = new FieldCondition.textMatch();
            // }
            else {
                return selectedColumns;
            }

            return [...selectedColumns, newColumnGroupBy ];

        }, [] ); */

        let groupedFields = [];
        Object.entries(req).forEach( ([reqField, reqValue]) => {
            if ( reqField.startsWith( "xgb" ) ) {
                groupedFields.push(reqValue);
            }
        });

        if(groupedFields.length > 0) return groupedFields;

        return false;

    },

    parse( req, responseModel, relation ) {

        let params = req; // .params;

        let filters = this.parseFilter( params, responseModel, relation );
        let selectedFields = URLquery.parseSelect( params, responseModel, relation );
        let groupedFields = this.parseGroup(params, responseModel, relation);

        return {filters, selectedFields, groupedFields};
    }
};

module.exports.URLquery = URLquery;
