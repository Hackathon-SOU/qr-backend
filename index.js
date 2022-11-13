const express = require('express');
const mongoose= require('mongoose');
const cors= require('cors');
const {notFound, errorHandling}= require('./middleware/errorHandler');
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
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());
app.use("/api/admin", require("./routes/admin"));
app.use("/api/canteen", require("./routes/canteen"));
app.use("/api/participant", require("./routes/participant"));


app.use(notFound);
app.use(errorHandling);
app.listen(process.env.port || 4000, () =>{
    console.log("Server is running on port 4000");
});
