const express= require('express');
const bodyParser= require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const {getuserDetails, markpresence, singleUserData, totalAbsent}= require("../controllers/userDetailsController")

const router= express.Router();

router.get('/getuserdetails',urlencodedParser,  getuserDetails);
router.put('/markpresence', urlencodedParser, markpresence);
router.post('/singleuserdata', urlencodedParser, singleUserData);
router.get('/totalabsent', urlencodedParser, totalAbsent);


module.exports = router;