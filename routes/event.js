const express= require('express');
const bodyParser= require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const {createEvent}= require("../controllers/eventController")
const verifyJwt= require("../controllers/jwtController");
const router= express.Router();

router.post("/createevent", urlencodedParser, verifyJwt, createEvent);

module.exports= router;