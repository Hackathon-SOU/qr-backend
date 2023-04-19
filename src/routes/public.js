const express = require("express");
const cors = require("cors");

const { verifyEmail } = require("../controllers/loginController");
const authValidation = require("../validation/auth.validation.js");
const validate = require("../middleware/validation.js");

const router = express.Router();

router.get(
  "/:userId/:token",
  validate(authValidation.adminVerifySchema),
  verifyEmail
);

module.exports = router;
