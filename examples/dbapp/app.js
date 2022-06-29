const express = require('express')
const app = express()
const port = 3000
const knex = require( './db/knex' );
const {func} = require( 'normalize' );

app.get('/', (req, res) => {
  res.send('Hello World!');
})


app.get('/model', (req, res) => {
  func();
  res.send('Library function called!');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;