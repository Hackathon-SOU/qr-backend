const express= require('express');
const {createFoodItem, getMenu, getCanteen}= require("../controllers/canteenController")
const {canteenLogin, getCanteenJwtToken}= require("../controllers/loginController")
const {verifyJwt, authorizeCanteen}= require("../middleware/verifyJwt");
const router= express.Router();

router.post("/login", canteenLogin);
router.get("/getjwttoken", getCanteenJwtToken);
router.post("/createfooditem", verifyJwt, authorizeCanteen, createFoodItem);
router.get("/getmenu", verifyJwt, authorizeCanteen, getMenu);
router.get("/getcanteen", verifyJwt, authorizeCanteen, getCanteen);

module.exports= router;