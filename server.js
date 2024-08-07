import express from "express";
import cors from "cors";
import expressSession from "express-session";
import { fileURLToPath } from "url";
import http from "http";
import { config } from "dotenv";
import { bot } from "./bot/bot.js";
import path from "path";
import morgan from "morgan";

const app = express();

config();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("./public"));
app.use(express.static(path.join(__dirname, "build")));
app.use(express.static(path.join(__dirname, "build-admin")));
app.use(
  cors({
    origin: "*",
  })
);
app.use(morgan("dev"));
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 6 day
    },
    saveUninitialized: false,
  })
);

app.set("view engine", "ejs");

// Routes
import { router } from "./routes.js";
import { router as locationRoutes } from "./src/routes/location.routes.js";

app.get("/admin", (req, res) => {
  console.log("admin page");
  res.sendFile(path.join(__dirname, "build-admin", "index.html"));
});

app.use("/api", router);

app.use("/locations", locationRoutes);

app.use("*", (req, res) => {
  console.log("users page");
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const port = process.env.PORT || 3333;

(() => {
  bot.launch();

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
  console.log(`Server is running on port`);
})();

http.createServer(app).listen(port);
