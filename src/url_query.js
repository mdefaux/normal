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
            else if ( reqField.startsWith( "b" ) ) {
                newCondition = new FieldCondition.between();
                return [...filters, newCondition.setup( columnName, reqValue ) ];
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

    parseRelated( req, responseModel, relation ) {

       // let groupBySelect = [];
        

        let select = Object.entries( req ).reduce( (relatedColumns, [reqField, reqValue]) => {
           // let newColumnSelected;
           /*  if ( reqField.startsWith( "xcount" ) ) {
                newColumnSelected = new FieldAggregationCount();
            }
            else */ if ( reqField.startsWith( "xrel" ) ) {
                return [...relatedColumns, responseModel[reqValue] ];
            }
/*             else if (reqField.startsWith( "xgb" ) ) {
                groupBySelect.push(reqValue);
                return selectedColumns;
            } */
            else {
                return relatedColumns;
            }

         // return [...relatedColumns, newColumnSelected ];

        }, [] );

       // if(groupBySelect.length > 0) return groupBySelect;
        return select;
    },

     parseParams( req, responseModel, relation ) {

       // let groupBySelect = [];
        

        let params = Object.entries( req ).reduce( (paramColumns, [reqField, reqValue]) => {
           // let newColumnSelected;
           /*  if ( reqField.startsWith( "xcount" ) ) {
                newColumnSelected = new FieldAggregationCount();
            }
            else */ if ( reqField.startsWith( "xparams" ) ) {
                // get a substring after xparams
                let paramName = reqField.substring(7);

                return {...paramColumns, [paramName]: reqValue};
                // [...paramColumns, responseModel[reqValue] ];
            }
/*             else if (reqField.startsWith( "xgb" ) ) {
                groupBySelect.push(reqValue);
                return selectedColumns;
            } */
            else {
                return paramColumns;
            }

         // return [...relatedColumns, newColumnSelected ];

        }, {} );

       // if(groupBySelect.length > 0) return groupBySelect;
        return params;
    },

    parse( req, responseModel, relation ) {

        let params = req; // .params;

        let filters = this.parseFilter( params, responseModel, relation );
        let selectedFields = URLquery.parseSelect( params, responseModel, relation );
        let groupedFields = this.parseGroup(params, responseModel, relation);
        let sortingFields = this.parseSort(params, responseModel, relation);
        let sumFields = this.parseSum( params, responseModel, relation);
        let withRelateds = this.parseRelated(params, responseModel, relation);
        let parameters = this.parseParams(params, responseModel, relation);

        if ( sortingFields?.[0]?.columnName 
            && responseModel.metaData.model.fields[ sortingFields[0].columnName ].type === 'ObjectLink' ) 
        {

        }

        if(sumFields.length > 0 ) selectedFields = [...selectedFields, ...sumFields]

        return {filters, selectedFields, groupedFields, sortingFields, sumFields, withRelateds, parameters};
    }
};

module.exports.URLquery = URLquery;
