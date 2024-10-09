// packages import
import express, { urlencoded } from "express";
import http from "http";

import { WebSocketServer } from "ws";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import expressSession from "express-session";
import cors from "cors";
import fs from "fs";
import path from "path";

import connectDB from "./config/dbconnect.js";
// routes import import
import AuthRoutes from "./routes/auth.js";
import PostsRoute from "./routes/posts.js";
import { AuthenticateUser } from "./controllers/auth.js";
import UsersRoute from "./routes/users.js";
import uploadRoute from "./routes/uploadFile.js";
import { v4 } from "uuid";
import { clients, handleClientRequest } from "./config/websocket-setup.js";
import { errorHandler } from "./middleware/error-handler.js";
import UserRoute from "./routes/user.js";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const __dirname = path.resolve();

app.use(
  cors({
    origin: ["http://localhost:8081", "http://192.168.138.204:8081"],
    credentials: true,
    methods: ["GET", "POST", "DELETE"],
  })
);

app.use(cookieParser());
app.use(urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("./public"));
app.use(
  expressSession({ secret: process.env.SESSION_KEY, saveUninitialized: false })
);

// routes setup
app.get(["/attachments/*"], (req, res) => {
  // let fileContent =
  fs.readFile(
    path.join(__dirname, "/public/attachments/", req.url),
    { encoding: "utf-8" },
    (err, data) => {
      if (err) {
        return res.sendFile(
          path.join(__dirname, "/public", "placeholder-img.svg")
        );
      }

      res.sendFile(path.join(__dirname, "/public/attachments/", req.url));
    }
  );
});

app.get(["/profile/*"], (req, res) => {
  // fileContent =
  fs.readFile(
    path.join(__dirname, "/public/profile/", req.url),
    { encoding: "utf-8" },
    (err, data) => {
      if (err) {
        return res.sendFile(
          path.join(__dirname, "/public", "placeholder-img.svg")
        );
      }

      res.sendFile(path.join(__dirname, "/public/profile/", req.url));
    }
  );
});

app.use("/api/v1/auth", AuthRoutes);
app.use(AuthenticateUser);
app.use("/api/v1/upload", uploadRoute);
app.use("/api/v1/users/", UsersRoute);
app.use("/api/v1/user/", UserRoute);
app.use("/api/v1/posts/", PostsRoute);
app.use(errorHandler);

// Server config
const port = process.env.PORT;
const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });

const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URL);
    server.listen(port, () =>
      console.log(`Server is listening on port ${port}`)
    );
    wsServer.on("connection", (connection) => {
      console.log(`Recieved a new connection.`);
      const user = v4();
      clients[user] = connection;
      connection.on("message", (message) => handleClientRequest(message, user));
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
