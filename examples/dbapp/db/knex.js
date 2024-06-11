var environment = process.env.NODE_ENV || "development";
// var config = require("../knexfile.js")[environment];
// module.exports = require("knex")(config);

import knexfile from "../knexfile.js";
import knex from "knex";

const config = knexfile[environment];
export default knex(config);
