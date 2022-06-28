
const URLquery = {

    parse( req, responseModel, relation ) {
        let filters = false;
        let selectedFields = false;
        let groupedFields = false;
        
        console.log("parsing url");

        return {filters, selectedFields, groupedFields};
    }
};

module.exports.URLquery = URLquery;
