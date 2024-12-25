const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 5001;
require("dotenv").config();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://assignment11-f7541.web.app",
    "https://assignment11-f7541.firebaseapp.com",
  ],
  credentials: true,
  optionalSuccessStatus: 200,
};

// middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Verify Token middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).send({ message: "unauthorized access" });
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
  });
  next();
};

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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );

    // Start here
    const db = client.db("booksDB");
    const booksCollection = db.collection("allBooks");
    const borrowedCollection = db.collection("borrowedBooks");

    // Generate JWT
    app.post("/jwt", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.SECRET_KEY, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // Clear cookie from browser
    app.get("/logout", async (req, res) => {
      res
        .clearCookie("token", {
          maxAge: 0,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

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
    app.patch("/book/:id", verifyToken, async (req, res) => {
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
      res.send(result);
    });

    // Add borrowed book to database
    app.post("/borrowBook", async (req, res) => {
      const borrowedBookData = req.body;
      // If a user has already borrowed
      const query = {
        email: borrowedBookData.email,
        bookID: borrowedBookData.bookID,
      };
      const alreadyExist = await borrowedCollection.findOne(query);
      if (alreadyExist)
        return res.status(400).send("You have already borrowed this book");

      // Save data in borrowed collection

      const result = await borrowedCollection.insertOne(borrowedBookData);

      // Increase book quantity
      const filter = { _id: new ObjectId(borrowedBookData.bookID) };
      const update = {
        $inc: { quantity: -1 },
      };

      const updatedQuantity = await booksCollection.updateOne(filter, update);

      res.send(result);
    });

    // Get borrowed books base on email
    app.get("/borrowedBooks/:email", verifyToken, async (req, res) => {
      const decodedEmail = req.user?.email;
      const email = req.params.email;
      if (decodedEmail !== email)
        return res.status(401).send({ message: "unauthorized access" });
      const query = { email };
      const result = await borrowedCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/return", async (req, res) => {
      const { id, bookID } = req.body;
      const filter = { _id: new ObjectId(bookID) };
      const update = {
        $inc: { quantity: 1 },
      };
      const updatedQuantity = await booksCollection.updateOne(filter, update);

      const queryForBorrowedCollection = { _id: new ObjectId(id) };
      const result = await borrowedCollection.deleteOne(
        queryForBorrowedCollection
      );

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
