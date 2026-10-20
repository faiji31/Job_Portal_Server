const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_DB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const jobCollection = client.db("hireloop_db").collection("jobs");

app.get("/", (req, res) => res.send("HireLoop server is running"));

app.get('/api/jobs',async(req,res)=>{
    const qeury = {}
    if(req.query.companyId){
        qeury.companyId = req.query.companyId
    }
    if(req.query.status){
        qeury.status = req.query.status
    }
    const cursor = jobCollection.find(qeury)
    const result = await cursor.toArray()
    res.send(result)
})

app.post("/api/jobs", async (req, res) => {
  try {
    const result = await jobCollection.insertOne({
      ...req.body,
      createdAt: new Date(),
    });
    res.status(201).json(result); // { acknowledged, insertedId }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create job" });
  }
});

async function start() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB");
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
start();