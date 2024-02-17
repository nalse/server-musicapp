"use strict";

var express = require("express");

var morganBody = require("morgan-body");

var cors = require("cors");

var api = require("./routes/api");

var app = express();
app.use(cors({
  origin: "http://localhost:3000"
}));
app.use(express.json());
morganBody(app);
app.use("/", api);
module.exports = app;