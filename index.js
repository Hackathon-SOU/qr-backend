const express = require('express');
const bodyParser= require('body-parser');
const mongoose= require('mongoose');
const cors= require('cors');
const path = require('path');
require("dotenv").config();


const mongodbString= process.env.DATABASE_URL;
mongoose.connect(mongodbString);
const database = mongoose.connection;

database.on("error", (error) =>{
    console.log("Database is not connected", error);
});

database.once("connected", () =>{
    console.log("Database is connected");
});



const app= express();
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.set('view engine', 'ejs');
app.use("/api", require("./routes/login"));
app.use("/api/event", require("./routes/event"));
app.use("/api/canteen", require("./routes/canteen"));
app.use("/api/participant", require("./routes/participant"));
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(process.env.port || 4000, () =>{
    console.log("Server is running on port 4000");
});
