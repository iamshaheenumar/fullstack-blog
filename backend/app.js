require("express-async-errors");
require("./db");
const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const cloudinary = require('cloudinary').v2;

const postRouter = require("./routers/post");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/posts", postRouter);
app.use(morgan("dev"));
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

app.listen(process.env.PORT || 8080, () => {
  console.log("Server ready at port:" + process.env.PORT || 8080);
});
