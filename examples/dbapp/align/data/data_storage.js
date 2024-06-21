const data = require('./data.json');
const store = require('../models/store')

module.exports = store.data( "Customer", data ); 
