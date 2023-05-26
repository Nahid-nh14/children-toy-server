const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000;

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gpfwl83.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
const productCollection = client.db('kids-super-car-12').collection('toys');

app.get('/alltoys', async (req, res) => {
    const result = await productCollection.find({}).limit(20).toArray();
    res.send(result);
})

const indexKey = {name:1};
const indexOptions = { name:'tagName'}

const result = await productCollection.createIndex(indexKey,indexOptions)

app.get('/toySearchByTitle/:text', async (req, res) => {
  const searchText = req.params.text
  const result = await productCollection.find({
    $or:[
      {
        $or:[{name: {
          $regex: searchText,
          $options: 'i'
      }}]
      }
    ]
  }).toArray();
  res.send(result);
} )



app.get('/toyDetails/:id', async (req, res) => {
    const result = await productCollection.findOne({_id: new ObjectId(req.params.id)});
    console.log(result);
    res.send(result);
})
app.get('/alltoy/toyDetail/:id', async (req, res) => {
    const result = await productCollection.findOne({_id: new ObjectId(req.params.id)});
    console.log(result);
    res.send(result);
})

app.get('/mytoy/edittoy/:id', async (req, res) => {
  const result = await productCollection.findOne({_id: new ObjectId(req.params.id)});
  res.send(result);
})



app.put('/updateToy/:id',async (req,res)=>{
  const id = req.params.id
  const query ={_id: new ObjectId(id)}
  const updateToy = req.body
// console.log(updateToy)
  const options = {upsert: true}
  const toy = {
    $set: {
      price: updateToy.price,
      available_quantity: updateToy.available_quantity,
      description: updateToy.description
    }
  }

  const result = await productCollection.updateOne(query,toy,options)
  res.send(result)
})


app.delete('/mytoy/:id',async (req,res)=>{
  const id = req.params.id
  const query ={_id: new ObjectId(id)}
  const result = await productCollection.deleteOne(query)
  res.send(result)
})

app.get('/alltoys/:category', async (req, res) => {
    console.log(req.params.category);
    if(req.params.category=='car' ||req.params.category=='truck'||req.params.category=='bus'){
        const result = await productCollection
        .find({sub_category: req.params.category}).toArray();
        return res.send(result)
    }
})

app.post('/alltoys', async(req,res)=>{
    const newToy = req.body;
    const result = await productCollection.insertOne(newToy);
    console.log(newToy)
    res.send(result)

  })


  app.get('/mytoy/:email', async (req, res) => {
    console.log(req.params.email);
    // const query ={};
    // const options = {
    //   sort: {"price":-1}
    // }
    const sort = req.query.sort
    const toys = await productCollection
      .find({
        seller_email: req.params.email,
      })
      .sort({"price":sort === 'asc'?1:-1})
      .toArray();
    res.send(toys);
  });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/',(req ,res) =>{
    res.send('simple app is running')
})

app.listen(port, ()=> {
    console.log(`simple curd is running on port , ${port}`)
})