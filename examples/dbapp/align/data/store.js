const store = require("../../../../src/ForteORM"); // require("normalize");
const { StoreHost } = require("../../../../src/orm/StoreHost");

store.setup( new StoreHost() );

module.exports = store;
