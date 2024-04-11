// packages import 
import express, { urlencoded } from "express";
import http from "http";

import { WebSocketServer } from "ws";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import expressSession from "express-session"

import connectDB from "./config/dbconnect.js"
// routes import import
import AuthRoutes from "./routes/auth.js";
import PostsRoute from './routes/posts.js';
import { AuthenticateUser } from "./controllers/auth.js";
import UserRoute from "./routes/users.js";
import uploadRoute from "./routes/uploadFile.js";
import { v4 } from "uuid";
import { clients, handleClientRequest } from "./config/websocket-setup.js";
import { errorHandler } from "./middleware/error-handler.js";

dotenv.config();

const app = express()

app.use(cookieParser());
app.use(urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static("./public"))
app.use(expressSession({ secret: process.env.SESSION_KEY, saveUninitialized: false }))

// app.use(bodyParser.urlencoded({ extended: false }))


// routes setup
app.use("/api/v1/auth", AuthRoutes)
app.use(AuthenticateUser)
app.use('/api/v1/upload', uploadRoute)
app.use("/api/v1/users/", UserRoute)
app.use("/api/v1/posts/", PostsRoute)
app.use(errorHandler)


// Server config
const port = process.env.PORT
const server = http.createServer(app)
const wsServer = new WebSocketServer({ server });


const startServer = async () => {
     try {
          await connectDB(process.env.MONGODB_URL)
          server.listen(port, () => console.log(`Server is listening on port ${port}`));
          wsServer.on("connection", (connection) => {
               console.log(`Recieved a new connection.`);
               const user = v4()
               clients[user] = connection
               connection.on('message', (message) => handleClientRequest(message, user))
          })
     } catch (error) {
          console.log(error)
     }
}

startServer();