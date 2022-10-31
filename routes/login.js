const express= require('express');
const bodyParser= require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const {registerView, loginView }= require("../controllers/loginController.js");

const router= express.Router();

router.post('/signup',urlencodedParser,  registerView);

router.post('/login', urlencodedParser,loginView);

module.exports= router;