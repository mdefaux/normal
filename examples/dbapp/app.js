const express = require('express')
const app = express()
const knex = require( './db/knex' );
const {func} = require( 'normalize' );
const cors=require ('cors')
const ormRoute = require( './routes/orm' );
const models = require('./models/index')

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.use('/orm', ormRoute);

/* app.get('/model/customer', (req, res) => { 
  
  let response = models.Customer.getModel().columns

  return  res.send(response);
}) */

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
    id:1, name:"Luis Muriel", address:"Bergamo", reference:"luismuriel@gmail.com", telephone:3395930427
  },
  {
    id:2, name:"Rodrigo de Paul", address:"Udine", reference:"rodrigodepaul@gmail.com", telephone:339519283
  },
  {
    id:3, name:"Lorenzo Insigne", address:"Napoli", reference:"lorenzoinsigne@gmail.com", telephone:339298416
  }
]


  return res.send(data);
})


app.get('/model/:entity', (req, res) => {
  if(!models[req.params.entity])  {
    return res.status(500).send("l'entity non esiste")
  }
  let response = models[req.params.entity].getModel().columns

  return  res.send(response);
})



module.exports = app;