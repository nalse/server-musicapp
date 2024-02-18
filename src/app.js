const express = require("express");
const morganBody = require("morgan-body");
const cors = require("cors");

const api = require("./routes/api")

const app = express();

app.use(cors({
  origin: "https://client.meliordism.az",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}))
app.use(express.json());

morganBody(app);

app.use("/", api);

module.exports = app;
