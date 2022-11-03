const express= require('express');
const bodyParser= require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const {createEvent, getEvent}= require("../controllers/eventController")
const {getuserDetails,getAllUserDetails, uploadSheet, markpresence, singleUserData, totalAbsent}= require("../controllers/userDetailsController")
const {adminRegister, adminLogin, getAdminJwtToken }= require("../controllers/loginController")
const {createCanteen, getMenu, getCanteen}= require("../controllers/canteenController")
const {verifyJwt, authorizeAdmin}= require("../middleware/verifyJwt");
const router= express.Router();

router.post('/signup',urlencodedParser,  adminRegister);

router.post('/login', urlencodedParser, adminLogin);

router.get('/getjwttoken', urlencodedParser, getAdminJwtToken);

router.post('/uploadSheet', urlencodedParser, verifyJwt, authorizeAdmin, uploadSheet);

router.get('/getalluserdetails',urlencodedParser,verifyJwt, authorizeAdmin,  getAllUserDetails);

router.get('/getuserdetails',urlencodedParser,verifyJwt, authorizeAdmin,  getuserDetails);

router.post('/singleuserdata', urlencodedParser,verifyJwt, authorizeAdmin, singleUserData);

router.put('/markpresence',urlencodedParser,verifyJwt, authorizeAdmin, markpresence);

router.get('/totalabsent', urlencodedParser, verifyJwt, authorizeAdmin, totalAbsent);

router.post("/createevent", urlencodedParser, verifyJwt, authorizeAdmin, createEvent);

router.get("/getevent", urlencodedParser, verifyJwt, authorizeAdmin, getEvent);

router.get("/getcanteen", urlencodedParser, verifyJwt, authorizeAdmin, getCanteen);

router.post("/createcanteen", urlencodedParser, verifyJwt, authorizeAdmin, createCanteen);

router.get("/getmenu", urlencodedParser, verifyJwt, authorizeAdmin, getMenu);

module.exports = router;