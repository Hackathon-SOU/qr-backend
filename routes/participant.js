const express= require('express');
const bodyParser= require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const {getuserDetails}= require("../controllers/userDetailsController")
const {participantLogin, getParticipantJwtToken}= require("../controllers/loginController")
const {orderFood, getAllTransaction, getCanteen, getMenu}= require("../controllers/canteenController")
const {verifyJwt, authorizeParticpant}= require("../middleware/verifyJwt");
const {getEvent}= require("../controllers/eventController")
const router= express.Router();

router.post('/login', urlencodedParser, participantLogin);

router.get('/getjwttoken', urlencodedParser, getParticipantJwtToken);

router.get('/getuserdetails',urlencodedParser,verifyJwt, authorizeParticpant, getuserDetails);

router.get("/getmenu", urlencodedParser, verifyJwt, authorizeParticpant, getMenu);

router.get("/getcanteen", urlencodedParser, verifyJwt, authorizeParticpant, getCanteen);

router.post("/orderfood", urlencodedParser, verifyJwt, authorizeParticpant, orderFood);

router.get("/getAllTransactions", urlencodedParser, verifyJwt, authorizeParticpant, getAllTransaction);

router.get("/getevent", urlencodedParser, verifyJwt, authorizeParticpant, getEvent);

module.exports = router;