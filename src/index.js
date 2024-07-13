import dotenv from "dotenv";
import connectDB from "./db/db.js";
import {app} from './app.js'

dotenv.config({
    path: "./.env"
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port ${process.env.PORT}`);
    }) 
})
.catch((err) => {
    console.log("MongoDB connection failed!!!", err);
})

/*
import express from "express";
const app = express();
( async () => {
    try {
        // connect with mongodb
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        // app error connecting or listening
        app.on("error", (error) => {
            console.log("ERROR", error);
            throw error;
        })

        // listening on port
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error) {   // error connecting the database
        console.error("ERROR", error);
        throw error;
    }
} )()
*/