import express from "express"
import cors from "cors"
import {fileURLToPath } from "url";


import { config } from "dotenv";

import { bot } from "./index.js"
import path from "path";


const app = express();
config();

const __filename = fileURLToPath(import.meta.url);


const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("./public"));
app.use(express.static(path.join(__dirname,"build")));
app.use(cors())


app.set('view engine', 'ejs');


// Routes
import { router } from "./routes.js";

app.use("/api", router);

app.get("*",(req,res)=>{
  res.sendFile(path.join(__dirname,"build","index.html"));
})


const port = process.env.PORT || 3333;

app.listen(port, () => {
    bot.launch();

    // Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));

    console.log(`Server is running on port ${port}`);
})
