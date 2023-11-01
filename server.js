import express from "express"
import cors from "cors"

import { config } from "dotenv";

import { bot } from "./index.js"


const app = express();
config();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("./public"));
app.use(cors())

app.set('view engine', 'ejs');


// Routes
import { router } from "./routes.js";

app.use("/api", router);



const port = process.env.PORT || 3333;

app.listen(port, () => {
    bot.launch();

    // Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));

    console.log(`Server is running on port ${port}`);
})
