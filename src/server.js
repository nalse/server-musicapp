const http = require("http");
const mongoose = require("mongoose")

const PORT = 8080;
const DB = "mongodb+srv://ulka:ulka2005@cluster0.0ztiq13.mongodb.net/test3"

const app = require("./app");

const connectDB = async () => {
    await mongoose
        .connect(DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => {
            console.log("DB Connection established")
        })
        .catch(e => {
            console.log(e)
        })
}

connectDB();

const server = http.createServer(app);

async function startServer() {
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}...`);
    })
}

startServer();
