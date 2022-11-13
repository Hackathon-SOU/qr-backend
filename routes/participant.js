const express= require('express');
const {getuserDetails}= require("../controllers/userDetailsController")
const {participantLogin, getParticipantJwtToken}= require("../controllers/loginController")
const {orderFood, getAllTransaction, getCanteen, getMenu}= require("../controllers/canteenController")
const {verifyJwt, authorizeParticpant}= require("../middleware/verifyJwt");
const {getEvent}= require("../controllers/eventController")
const router= express.Router();

router.post('/login', participantLogin);

router.get('/getjwttoken', getParticipantJwtToken);

router.get('/getuserdetails',verifyJwt, authorizeParticpant, getuserDetails);

router.get("/getmenu", verifyJwt, authorizeParticpant, getMenu);

router.get("/getcanteen", verifyJwt, authorizeParticpant, getCanteen);

router.post("/orderfood", verifyJwt, authorizeParticpant, orderFood);

router.get("/getAllTransactions", verifyJwt, authorizeParticpant, getAllTransaction);

router.get("/getevent", verifyJwt, authorizeParticpant, getEvent);

module.exports = router;