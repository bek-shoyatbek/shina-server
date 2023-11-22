import express from "express"
import cors from "cors"

import { fileURLToPath } from "url";
import http from "http";
import morgan from  "morgan";

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
  origin:'*'
}))



// Routes
import { router } from "./routes.js";

app.get("/admin",(req,res)=>{
   res.sendFile(path.join(__dirname, "build-admin", "index.html"));
});

app.use("/api", router);

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







