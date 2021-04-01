const express = require('express')
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectID=require('mongodb').ObjectID;
const cors=require('cors');
const bodyParser=require('body-parser');
require('dotenv').config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.et2e1.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const shirtCollection = client.db("TShirtDb").collection("shirts");
  const orderCollection = client.db("TShirtDb").collection("orders");

  //get all products
  app.get('/products',(req,res)=>{
    shirtCollection.find()
    .toArray((err,items)=>{
        res.send(items);
    })
  })
  //get single product
  app.get('/singleProduct/:id',(req,res)=>{
    shirtCollection.find({_id:ObjectID(req.params.id)})
    .toArray((err,documents)=>{
      res.send(documents[0])
    })
  })
  //post to add product
  app.post('/addProduct',(req,res)=>{
      const newProduct =req.body;
      shirtCollection.insertOne(newProduct)
      .then(result=>{
          res.send(result.insertedCount>0)
          
      })
  })
  //patch to update single product info
  app.patch('/updateProduct/:id',(req,res)=>{
    shirtCollection.updateOne({_id:ObjectID(req.params.id)},
    {
      $set:{name:req.body.name,price:req.body.price,brand:req.body.brand}
    })
    .then(result=>{
      res.send(result.modifiedCount>0)
    })
  })
  //delete product
  app.delete('/deleteProduct/:id',(req,res)=>{
    shirtCollection.deleteOne({_id:ObjectID(req.params.id)})
    .then((result)=>{
      res.send(result.deletedCount>0)
    })
  })
  //post orders
  app.post('/addOrder',(req,res)=>{
    const newOrder =req.body;
    orderCollection.insertOne(newOrder)
    .then(result=>{
        res.send(result.insertedCount>0)
    })
})

//load orders for specific user
app.get('/loadOrders/:email',(req,res)=>{
  orderCollection.find({email:req.params.email})
  .toArray((err,documents)=>{
    res.send(documents)
  })
})
//delete Order
app.delete('/deleteOrder/:id',(req,res)=>{
  orderCollection.deleteOne({_id:ObjectID(req.params.id)})
  .then((result)=>{
    res.send(result.deletedCount>0)
  })
})
});


app.listen(port)