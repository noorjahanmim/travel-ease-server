const express = require('express'); const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config()
const app = express();
const port = process.env.PORT || 3000;


// Middlewares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.hdnectc.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {

    // await client.connect();

    const db = client.db('model-db')
    const modelCollection = db.collection('models')
    const bookingsCollection = db.collection('bookings');


    app.get('/models/latest', async (req, res) => {
      const result = await modelCollection.find().sort({ createdAt: -1 }).limit(6).toArray();
      res.send(result);
    })


    //             app.get('/models', async(req, res)=> {
    //   const result = await modelCollection
    //     .find()
    //     .sort({createdAt: -1})
    //     .toArray();
    //   res.send(result);
    // });


    app.get('/models', async (req, res) => {
      const { userEmail } = req.query;  
      const query = {};

      if (userEmail) {
        query.userEmail = userEmail;   
      }

      try {
        const vehicles = await modelCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();
        res.send(vehicles);
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch vehicles" });
      }
    });




    app.get('/models/:id', async (req, res) => {
      const { id } = req.params;

      try {
        const vehicle = await modelCollection.findOne({ _id: new ObjectId(id) });
        if (!vehicle) return res.status(404).send({ message: "Vehicle not found" });
        res.send(vehicle);
      } catch (err) {
        res.status(500).send({ message: "Invalid ID or server error" });
      }
    });


    app.post('/models', async (req, res) => {
      const vehicle = { ...req.body, createdAt: new Date() };
      try {
        const result = await modelCollection.insertOne(vehicle);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Failed to add vehicle" });
      }
    });



    // app.get('/myBookings', async (req, res) => {
    //   const email = req.query.email;
    //   try {
    //     const bookings = await bookingsCollection.find({ userEmail: email }).toArray();
    //     res.send(bookings);
    //   } catch (err) {
    //     res.status(500).send({ message: "Failed to fetch bookings" });
    //   }
    // });

    app.get('/myBookings', async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).send({ message: "Email is required" });
  }

  try {
    const bookings = await bookingsCollection
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    res.send(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to fetch bookings" });
  }
});




    app.put('/models/:id', async (req, res) => {
      const { id } = req.params;
      const updatedVehicle = req.body;

      try {
        const result = await modelCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedVehicle }
        );

        if (result.matchedCount === 0)
          return res.status(404).send({ message: "Vehicle not found" });

        res.send({ message: "Vehicle updated successfully" });
      } catch (err) {
        res.status(500).send({ message: "Failed to update vehicle" });
      }
    });



    app.delete('/models/:id', async (req, res) => {
      const { id } = req.params;

      try {
        const result = await modelCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Vehicle not found" });
        }

        res.send({ message: "Vehicle deleted successfully" });
      } catch (err) {
        res.status(500).send({ message: "Failed to delete vehicle" });
      }
    });



    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('TravelEase server is running')
})


app.listen(port, () => {

  console.log(`TravelEase server is runnig on port: ${port}`)
});