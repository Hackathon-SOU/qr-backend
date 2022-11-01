const express= require('express');
const bodyParser= require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const {getuserDetails, uploadSheet, markpresence, singleUserData, totalAbsent}= require("../controllers/userDetailsController")
const verifyJwt= require("../controllers/jwtController");
const router= express.Router();

router.get('/getuserdetails',urlencodedParser,verifyJwt,  getuserDetails);
router.put('/markpresence',urlencodedParser,verifyJwt, markpresence);
router.post('/singleuserdata', urlencodedParser,verifyJwt, singleUserData);
router.get('/totalabsent', urlencodedParser, verifyJwt, totalAbsent);
router.post('/uploadSheet', urlencodedParser, verifyJwt, uploadSheet);


module.exports = router;