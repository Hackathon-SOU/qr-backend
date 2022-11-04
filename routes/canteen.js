const express= require('express');
const bodyParser= require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const {createFoodItem, getMenu, getCanteen}= require("../controllers/canteenController")
const {canteenLogin, getCanteenJwtToken}= require("../controllers/loginController")
const {verifyJwt, authorizeCanteen}= require("../middleware/verifyJwt");
const router= express.Router();

router.post("/login", urlencodedParser, canteenLogin);
router.get("/getjwttoken", urlencodedParser, getCanteenJwtToken);
router.post("/createfooditem", urlencodedParser, verifyJwt, authorizeCanteen, createFoodItem);
router.get("/getmenu", urlencodedParser, verifyJwt, authorizeCanteen, getMenu);
router.get("/getcanteen", urlencodedParser, verifyJwt, authorizeCanteen, getCanteen);

module.exports= router;