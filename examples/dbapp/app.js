const express = require('express')
const app = express()
const port = 3000
const knex = require( './db/knex' );
const {func} = require( 'normalize' );
const cors=require ('cors')
const ormRoute = require( './routes/orm' );

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.use('/orm', ormRoute);


app.get('/model', (req, res) => {
  func();
  res.send('Library function called!');
})

app.get('/model', (req, res) => {
  
  let response = {
    asset: true,
    customer: true,
    service: true,
  }

  res.send(response);
})

app.get('/model/asset', (req, res) => {
  
  let response = {
    colums: true,
    colums:{
      part_number:true,
      Vendor:true,
    }
  }

  res.send(response);
}) 

app.get('/orm/asset/all', (req, res) => {

  console.log(req.query);

  var response = [];

  for(const key in req.query) {

    var element = {};

    let singleChar = key.substring(0,1).toLowerCase();
    let doubleChar = key.substring(0,2).toLowerCase();
    let singleType = key.substring(1);
    let doubleType = key.substring(2);



    if(singleChar == 'i')
    {  
        if(singleType=='Customer'){
          element.column = "id_customer";
        } else{
          element.column = singleType;
        }
    } 

    if(doubleChar == 'gb')
    {
      if(doubleType=='Customer'){
        element.column = "id_customer";
      } else{
        element.column = doubleType;
      }
    }

    if(doubleChar == 'sl')
    {  
        if(doubleType=='part_number'){
          element.column = "part_number";
        } else{
          element.column = doubleType;
        }
    }

    response.push(element);
  }

  res.send(response);
}) 

app.get('/datagrid', (req, res) => {
  
  let data = [{
    id:1, nome:"a", cognome:"b"
  },
  {
    id:2, nome:"c", cognome:"d"
  },
  {
    id:3, nome:"e", cognome:"f"
  }
]

  return data;
})




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;