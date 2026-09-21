const store = require("../../src/ForteORM"); // require("normalize");
const { StoreHost } = require("../../src/orm/StoreHost");
const DataStorage = require("../../src/DataStorage");

store.setup( new DataStorage() );

module.exports = store;
