const { FieldAggregationCount, FieldAggregation, /* FieldAggregationGroupBy */ } = require("./orm/FieldAggregation");
const FieldCondition = require("./orm/FieldCondition");

const URLquery = {

    parseFilter( req, responseModel, relation ) {

        return Object.entries( req ).reduce( (filters, [reqField, reqValue]) => {
            let newCondition;
            let columnName = reqField.substring(1);
            if ( reqField.startsWith( "i" ) ) {
                newCondition = new FieldCondition.in();
                return [...filters, newCondition.setup( columnName, reqValue ) ];
            }
            else if ( reqField.startsWith( "n" ) ) {
                newCondition = new FieldCondition.notIn();
                return [...filters, newCondition.setup( columnName, reqValue ) ];
            }

            if ( reqValue.length > 1 ) {
                // newCondition = new FieldCondition.or();
// return 
            }
            
            if ( reqField.startsWith( "c" ) ) {
                newCondition = new FieldCondition.textMatch();
            }
            else if ( reqField.startsWith( "l" ) ) {
                newCondition = new FieldCondition.less();
            }
            else if ( reqField.startsWith( "s" ) ) {
                newCondition = new FieldCondition.lessOrEqual();
            }
            else if ( reqField.startsWith( "g" ) ) {
                newCondition = new FieldCondition.greater();
            }
            else if ( reqField.startsWith( "r" ) ) {
                newCondition = new FieldCondition.greaterOrEqual();
            }
            
            if ( !newCondition ) {
                return filters;
            }

            return [...filters, newCondition.setup( columnName, reqValue[0] ) ];


        }, [] );
    },

    parseSelect( req, responseModel, relation ) {

        let groupBySelect = [];
        

        let select = Object.entries( req ).reduce( (selectedColumns, [reqField, reqValue]) => {
            let newColumnSelected;
            if ( reqField.startsWith( "xcount" ) ) {
                newColumnSelected = new FieldAggregationCount();
            }
            else if ( reqField.startsWith( "xsel" ) ) {
                return [...selectedColumns, ...reqValue ];
            }
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

        // let groupedFields = [];
        // Object.entries(req).forEach( ([reqField, reqValue]) => {
        //     if ( reqField.startsWith( "xgb" ) ) {
        //         groupedFields.push(reqValue);
        //     }
        // });
        let groupedFields = Object.entries(req).reduce( (acc, [reqField, reqValue]) => {

            if ( reqField.startsWith( "xgb" ) ) {
                return [...acc, ...reqValue ];
            }
            return acc;
        }, [] );

        if(groupedFields.length > 0) return groupedFields;

        return false;

    },

    parseSort( req, responseModel, relation ) {

        return Object.entries( req ).reduce( (sortedColumns, [reqField, reqValue]) => {
                let newColumnSortBy;
                if ( reqField === "asc" ) {
                    newColumnSortBy = { order: "asc", columnName: reqValue };
                }
                else if ( reqField === "desc" ) {
                    newColumnSortBy = { order: "desc", columnName: reqValue };
                }
                else {
                    return sortedColumns;
                }

                return [...sortedColumns, newColumnSortBy ];

            }, [] );

    },

    parseSum( req, responseModel, relation ) {

        let sumFields = Object.entries(req).reduce( (acc, [reqField, reqValue]) => {
     
                 if ( reqField.startsWith( "xsum" ) ) {
                    return [...acc, ...reqValue ];
                 }
                 return acc;
             }, [] );
     
        if(sumFields.length > 0) {
            let sumFieldAggregations = sumFields.reduce((acc, e) => {
                let field = responseModel[e];

                if(field) {
                    let fieldAggregation = new FieldAggregation(field, "sum");

                    return [...acc, fieldAggregation]
                }

                return acc;
            }, []);

        //return sumFields;
            if(sumFieldAggregations.length > 0) return sumFieldAggregations
        }
     
        return false;
     
    },

    parse( req, responseModel, relation ) {

        let params = req; // .params;

        let filters = this.parseFilter( params, responseModel, relation );
        let selectedFields = URLquery.parseSelect( params, responseModel, relation );
        let groupedFields = this.parseGroup(params, responseModel, relation);
        let sortingFields = this.parseSort(params, responseModel, relation);
        let sumFields = this.parseSum( params, responseModel, relation);

        if ( sortingFields?.[0]?.columnName 
            && responseModel.metaData.model.fields[ sortingFields[0].columnName ].type === 'ObjectLink' ) 
        {

        }

        if(sumFields.length > 0 ) selectedFields = [...selectedFields, ...sumFields]

        return {filters, selectedFields, groupedFields, sortingFields, sumFields};
    }
};

module.exports.URLquery = URLquery;
