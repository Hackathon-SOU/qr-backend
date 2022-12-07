const express = require('express');

const {
    getuserDetails
} = require("../controllers/userDetailsController")

const {
    participantLogin,
    getParticipantJwtToken
} = require("../controllers/loginController")

const {
    orderFood,
    getAllTransaction,
    getCanteen,
    getMenu
} = require("../controllers/canteenController")

const {
    getEvent
} = require("../controllers/eventController")

const {
    verifyJwt,
    authorizeParticpant
} = require("../middleware/verifyJwt");

const validate = require("../middleware/validation")
const authValidation = require("../validation/auth.validation");
const participantValidation = require("../validation/participant.validation.js");
const canteenValidation = require("../validation/canteen.validation.js");

const router = express.Router();

router.post('/login', validate(authValidation.userLoginSchema), participantLogin);

router.get('/getjwttoken', getParticipantJwtToken);

router.get('/getuserdetails', verifyJwt, authorizeParticpant, getuserDetails);

router.get("/getmenu", verifyJwt, authorizeParticpant, validate(canteenValidation.getMenuSchema), getMenu);

router.get("/getcanteen", verifyJwt, authorizeParticpant, getCanteen);

router.post("/orderfood", verifyJwt, authorizeParticpant, validate(canteenValidation.transactionSchema), orderFood);

router.get("/getAllTransactions", verifyJwt, authorizeParticpant, getAllTransaction);

router.get("/getevent", verifyJwt, authorizeParticpant, getEvent);

module.exports = router;