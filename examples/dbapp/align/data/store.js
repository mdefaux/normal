const store = require("../../../../src/ForteORM"); // require("normalize");
const { StoreHost } = require("../../../../src/orm/StoreHost");

store.setupSecondaryHost( new StoreHost() );

module.exports = store;
