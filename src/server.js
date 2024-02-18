const http = require("http");
const mongoose = require("mongoose")

const PORT = 8080;
const DB = "mongodb+srv://ulka:ulka2005@cluster0.0ztiq13.mongodb.net/test3"

const app = require("./app");

// CORS ayarlarını ekliyoruz
app.use(cors({
  origin: "https://client.meliordism.az", // İstemci domaini
  methods: ["GET", "POST", "PUT", "DELETE"], // İzin verilen HTTP yöntemleri
  allowedHeaders: ["Content-Type", "Authorization"], // İzin verilen başlıklar
  credentials: true, // İsteğin doğruluğunu kontrol etmek için gerekli
}));

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
