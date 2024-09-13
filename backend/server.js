const express = require("express");
const cors = require("cors")
const passport = require('./config/passport');
const session = require('express-session');
const connectDb = require("./config/dbConnection");
const bodyParser = require('body-parser');
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Use Routes
app.use("/auth", require("./routes/authRoutes"));
app.use('/user', require("./routes/userRoutes"));


connectDb();

// Start the server
const PORT =  5000 || process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
