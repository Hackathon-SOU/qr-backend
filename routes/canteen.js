const express= require('express');
const bodyParser= require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const {createCanteen, createFoodItem, orderFood, getMenu, getCanteen}= require("../controllers/canteenController")
const verifyJwt= require("../controllers/jwtController");
const router= express.Router();

router.post("/createcanteen", urlencodedParser, verifyJwt, createCanteen);
router.post("/createfooditem", urlencodedParser, verifyJwt, createFoodItem);
router.get("/getmenu", urlencodedParser, verifyJwt, getMenu);
router.get("/getcanteen", urlencodedParser, verifyJwt, getCanteen);
router.post("/orderfood", urlencodedParser, verifyJwt, orderFood);

module.exports= router;