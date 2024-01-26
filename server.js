import express from "express"
import cors from "cors"
import expressSession from "express-session";
import { fileURLToPath } from "url";
import http from "http";
import morgan from "morgan";

import { config } from "dotenv";



import { bot } from "./bot.js";

import path from "path";

const app = express();

config();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("short"));
app.use(express.static("./public"));
app.use(express.static(path.join(__dirname, "build")));
app.use(express.static(path.join(__dirname, "build-admin")));
app.use(cors({
  origin: '*'
}))
app.use(expressSession({
  secret: process.env.SESSION_SECRET,
  resave: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  },
  saveUninitialized: false
}));

app.set("view engine", "ejs");
app.set("views", "namozvaqti/views");




// Routes
import { router } from "./routes.js";
import namozvaqtiRouter from "./namozvaqti.uz.js";
import killerRoute from "./namozvaqti/routes/index.js";

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "build-admin", "index.html"));
});

app.use("/killer", killerRoute);

app.use("/api", router);

app.use("/namozvaqti", namozvaqtiRouter);

app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
})



const port = process.env.PORT || 3333;

(() => {
  bot.launch();

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
  console.log(`Server is running on port`);
})()

http.createServer(app).listen(port);







