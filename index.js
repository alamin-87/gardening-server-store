const express = require("express");
const app = express();
const cors = require("cors");
const port = 4000;
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

app.use(cors());
app.use(express.json());
// Add COOP headers to suppress warning
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// ---------------mongodb connect--------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.umfqodo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const userCollection = client
      .db("gardeningDB")
      .collection("usersCollection");
    // --------users info-----
    //  user get data
    app.get("/users", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        const result = await userCollection.find().toArray();
        return res.send(result);
      }
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    // user post data
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });
    // update user
    app.patch("/users", async (req, res) => {
      const { email, lastSignInTime } = req.body;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          lastSignInTime: lastSignInTime,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Gardening Start");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
