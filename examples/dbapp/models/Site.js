const Customer = require("./Customer");
const store = require("./store");


const Site = store.entity("Site", (model) => {
    model.source("site");
    model.label("address");
    model.string("address");
    // model.number("customer_id");
    model.objectLink(Customer, "Customer")
        .source("customer_id");
});

module.exports = Site;
