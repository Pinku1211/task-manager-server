const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors({
  origin: [
    'http://localhost:5173',
  ],
  credentials: true
}));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r8pib.mongodb.net/?retryWrites=true&w=majority`;

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

    const taskCollection = client.db('task-management').collection('tasks');

    app.post('/tasks', async (req, res) => {
      const newTask = req.body;
      const result = await taskCollection.insertOne(newTask)
      console.log(result)
      res.send(result)
    })

    app.get('/tasks/:email', async (req, res) => {
      const email = req.params.email
      const query = { user_email: email }
      const result = await taskCollection.find(query).toArray()
      res.send(result)
    })

    app.delete('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query)
      res.send(result)
    })
    app.get('/task/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.findOne(query)
      res.send(result)
      console.log(result)
    })

    app.put('/status/:id', async (req, res) => {
      const id = req.params.id
      const newStatus = req.body.status
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const changeStatus = {
        $set: {
          "status": newStatus
        }
      }
      const result = await taskCollection.updateOne(filter, changeStatus, options)
      res.send(result)
    })

    app.put('/task/:id', async (req, res) => {
      const id = req.params.id
      const updatedTask = req.body
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const task = {
        $set: {
          title: updatedTask.title,
          description: updatedTask.description,
          deadline: updatedTask.deadline,
          priority: updatedTask.priority
        }
      }
      const result = await taskCollection.updateOne(filter, task, options)
      res.send(result)
    })

    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('server is running')
  });
  
  app.listen(port, () => {
    console.log(`server is running on port:${port}`)
  });