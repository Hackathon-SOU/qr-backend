const express = require('express');


const {
    createFoodItem,
    getMenu,
    getCanteen
} = require("../controllers/canteenController")
const {
    canteenLogin,
    getCanteenJwtToken
} = require("../controllers/loginController")
const {
    verifyJwt,
    authorizeCanteen
} = require("../middleware/verifyJwt");
const validate = require('../middleware/validation.js');
const authValidation = require("../validation/auth.validation");
const canteenValidation = require("../validation/canteen.validation");

const router = express.Router();

router.post("/login", validate(authValidation.canteenLoginSchema), canteenLogin);
router.get("/getjwttoken", getCanteenJwtToken);
router.post("/createfooditem", verifyJwt, authorizeCanteen, validate(canteenValidation.foodRegisterSchema), createFoodItem);
router.get("/getmenu", verifyJwt, authorizeCanteen, getMenu);
router.get("/getcanteen", verifyJwt, authorizeCanteen, getCanteen);

module.exports = router;