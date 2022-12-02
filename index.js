const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(express.json());
app.use(cors());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  console.log(authHeader);

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

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
  const categoriesCollection = client.db("mobileDeal").collection("Brands");
  const ordersCollection = client.db("mobileDeal").collection("orders");
  const reportedPhonesCollection = client
    .db("mobileDeal")
    .collection("reportedPhones");
  const wishCollection = client.db("mobileDeal").collection("wishlist");

  try {
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "2h",
        });
        return res.send({ mobileToken: token });
      }
      res.status(403).send({ mobileToken: "" });
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "Admin" });
    });

    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.role === "Seller" });
    });

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

    app.get("/categorieshome", async (req, res) => {
      const query = {};
      const result = await categoriesCollection.find(query).limit(3).toArray();
      res.send(result);
    });

    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await categoriesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/phones/:brandname", async (req, res) => {
      const brandname = req.params.brandname;
      console.log(brandname);
      const query = { brandname: brandname };
      const result = await phonesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/allphones", async (req, res) => {
      const query = {};
      const result = await phonesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/advertisedphones", async (req, res) => {
      const query = { advertise: true, status: "Available" };
      const result = await phonesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/phonedetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await phonesCollection.findOne(query);
      res.send(result);
    });

    app.post("/addtowishlist", async (req, res) => {
      const wishedPhone = req.body;
      delete wishedPhone._id;
      const result = await wishCollection.insertOne(wishedPhone);
      res.send(result);
    });

    app.get("/mywishedphones", async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await wishCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/dashboard/removefromwishlist/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await wishCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/addorder", async (req, res) => {
      const order = req.body;
      delete order._id;
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });

    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { buyerEmail: email };
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/dashboard/cancelorder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/reportPhone", async (req, res) => {
      const reportedPhone = req.body;
      delete reportedPhone._id;
      const result = await reportedPhonesCollection.insertOne(reportedPhone);
      res.send(result);
    });

    app.get("/mylistings", async (req, res) => {
      const email = req.query.email;
      const query = { selleremail: email };
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
      const result = await phonesCollection.updateOne(
        query,
        updatedDoc,
        options
      );
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

    app.put("/changeStatus", async (req, res) => {
      const id = req.query.id;
      const status = req.headers.status;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: status,
        },
      };
      const result = await phonesCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.get("/reportedphones", async (req, res) => {
      const query = {};
      const result = await reportedPhonesCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/dashboard/deletereportedphone/:id", async (req, res) => {
      const id = req.params.id;
      const reportedquery = { _id: ObjectId(id) };
      const query = { phoneId: id };
      const result = await phonesCollection.deleteOne(reportedquery);
      const reportresult = await reportedPhonesCollection.deleteMany(query);
      res.send(result);
    });

    app.get("/dashboard/alluser", async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/dashboard/allseller", async (req, res) => {
      const query = { role: "Seller" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/dashboard/allbuyer", async (req, res) => {
      const query = { role: "Buyer" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/deleteuser", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/makeadmin", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      updatedDoc = {
        $set: {
          role: "Admin",
        },
      };
      const result = await usersCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    app.put("/verify", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          verified: true,
        },
      };
      const result = await usersCollection.updateOne(
        query,
        updatedDoc,
        options
      );
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
