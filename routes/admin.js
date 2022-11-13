const express= require('express');
const {createEvent, getEvent}= require("../controllers/eventController")
const {getuserDetails,getAllUserDetails, uploadSheet, markpresence, singleUserData, totalAbsent}= require("../controllers/userDetailsController")
const {adminRegister, canteenRegister, adminLogin, getAdminJwtToken }= require("../controllers/loginController")
const {getMenu, getCanteen}= require("../controllers/canteenController")
const {verifyJwt, authorizeAdmin}= require("../middleware/verifyJwt");
const multerUpload = require("../middleware/uploadSheet");
const router= express.Router();

router.post('/signup',  adminRegister);

router.post('/login', adminLogin);

router.get('/getjwttoken', getAdminJwtToken);

router.post('/uploadSheet', verifyJwt, authorizeAdmin, multerUpload, uploadSheet);

router.get('/getalluserdetails',verifyJwt, authorizeAdmin,  getAllUserDetails);

router.get('/getuserdetails',verifyJwt, authorizeAdmin,  getuserDetails);

router.post('/singleuserdata',verifyJwt, authorizeAdmin, singleUserData);

router.put('/markpresence',verifyJwt, authorizeAdmin, markpresence);

router.get('/totalabsent', verifyJwt, authorizeAdmin, totalAbsent);

router.post("/createevent", verifyJwt, authorizeAdmin, createEvent);

router.get("/getevent", verifyJwt, authorizeAdmin, getEvent);

router.get("/getcanteen", verifyJwt, authorizeAdmin, getCanteen);

router.post("/createcanteen", verifyJwt, authorizeAdmin, canteenRegister);

router.get("/getmenu", verifyJwt, authorizeAdmin, getMenu);

module.exports = router;