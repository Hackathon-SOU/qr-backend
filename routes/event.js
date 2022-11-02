const express= require('express');
const bodyParser= require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const {createEvent, getEvent}= require("../controllers/eventController")
const verifyJwt= require("../controllers/jwtController");
const router= express.Router();

router.post("/createevent", urlencodedParser, verifyJwt, createEvent);
router.get("/getevent", urlencodedParser, verifyJwt, getEvent);

module.exports= router;