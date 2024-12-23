const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5001;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.85wcl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Start here
    const db = client.db("booksDB")
    const booksCollection = db.collection("allBooks");
    const borrowedCollection = db.collection("borrowedBooks");

    // Get all books from database
    app.get("/allBooks", async (req, res) => {
      const cursor = booksCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get books by category
    app.get("/booksByCategory", async (req, res) => {
      const category = req.query.category;
      const query = { category: category };
      const cursor = booksCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get book by id
    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.findOne(query);
      res.send(result);
    });

    // Add a book to database
    app.post("/addBook", async (req, res) => {
      const newBook = req.body;
      const result = await booksCollection.insertOne(newBook);
      res.send(result);
    });

    // Update a book by id
    app.patch("/book/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedBook = req.body;
      const book = {
        $set: {
          coverImage: updatedBook.coverImage,
          title: updatedBook.title,
          authorName: updatedBook.authorName,
          category: updatedBook.category,
          rating: updatedBook.rating,
        },
      };

      const result = await booksCollection.updateOne(filter, book, options);
      console.log(result);
      res.send(result);
    });

    app.post("/borrowBook", async (req, res) => {
      const borrowedBookData = req.body;
      // If a user has already borrowed
      // const query = { email: borrowedBookData.email, bookID: borrowedBookData.bookID };
      // const alreadyExist = await borrowedCollection.findOne(query);
      // console.log("If already exist-->", alreadyExist);
      // if (alreadyExist)
      //   return res
      //     .status(400)
      //     .send("You have already borrowed this book");

      // Save data in borrowed collection
      console.log(borrowedBookData)
      const result = await borrowedCollection.insertOne(borrowedBookData);
      console.log(result)
      // Increase book quantity
      // const filter = { _id: new ObjectId(borrowedBookData.bookID) };
      // const update = {
      //   $inc: { quantity: -1 },
      // };
      // const updateBidCount = await booksCollection.updateOne(filter, update);
      // console.log(updateBidCount);
      res.send(result);
    });

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("A11 server is working");
});

app.listen(port, () => {
  console.log(`A11 server is running on port: ${port}`);
});
