const express = require("express");
const morganBody = require("morgan-body");
const cors = require("cors");

const api = require("./routes/api")

const app = express();

app.use(cors({
    origin: "http://localhost:3000"
}))
app.use(express.json());

morganBody(app);

app.use("/", api);

module.exports = app;