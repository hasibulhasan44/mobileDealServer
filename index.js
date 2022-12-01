const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(express.json());
app.use(cors());

function run() {
  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.eexlwpm.mongodb.net/?retryWrites=true&w=majority`;
  console.log(uri);
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

  const usersCollection = client.db("mobileDeal").collection("users");
  const phonesCollection = client.db("mobileDeal").collection("phones");
  const categoriesCollection = client.db("mobileDeal").collection('Brands')
  try {

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.post("/phones", async (req, res) => {
      const phone = req.body;
      const result = await phonesCollection.insertOne(phone);
      res.send(result);
    });

    app.get('/categorieshome', async(req, res)=>{
      const query = {};
      const result = await categoriesCollection.find(query).limit(3).toArray();
      res.send(result);
    })

    app.get('/categories', async(req, res)=>{
      const query = {};
      const result = await categoriesCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/phones/:brandname', async(req, res) => {
      const brandname = req.params.brandname;
      console.log(brandname);
      const query = {brandname: brandname};
      const result = await phonesCollection.find(query).toArray();
      res.send(result)
    })

    app.get('/allphones', async(req, res) => {
      const query = {};
      const result = await phonesCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/phonedetails/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id : ObjectId(id)};
      const result = await phonesCollection.findOne(query);
      res.send(result);
    })

    app.get("/mylistings", async (req, res) => {
      const email = req.query.email;
      const query = {selleremail: email};
      const result = await phonesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await phonesCollection.findOne(query);
      res.send(result);
    });

    app.put("/updateitem", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const updatedCarDetails = req.body;
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          brandname: updatedCarDetails.brandname,
          modelname: updatedCarDetails.modelname,
          imageURL: updatedCarDetails.imageURL,
          devicedetails: updatedCarDetails.devicedetails,
          location: updatedCarDetails.location,
          monthsused: updatedCarDetails.monthsused,
          originalprice: updatedCarDetails.originalprice,
          resaleprice: updatedCarDetails.resaleprice,
          selleremail: updatedCarDetails.selleremail,
          sellername: updatedCarDetails.sellername,
          sellerimg: updatedCarDetails.sellerimg,
          sellerverified: updatedCarDetails.sellerverified,
        },
      };
      const result = await phonesCollection.updateOne(query, updatedDoc, options);
      res.send(result);
    });

    app.delete("/deleteitem", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const result = await phonesCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/advertiseitem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          advertise: true,
        },
      };
      const result = await phonesCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

  } catch {}
}
run();

app.get("/", (req, res) => {
  res.send("mobile-deal is running");
});

app.listen(port, () => {
  console.log(`mobile-deal running on ${port}`);
});
