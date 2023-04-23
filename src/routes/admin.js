const express = require("express");
const cors = require("cors");

const {
  createEvent,
  getEvent,
  getEventReport,
  deleteEvent,
} = require("../controllers/eventController");
const {
  getuserDetails,
  getAllUserDetails,
  uploadSheet,
  markpresence,
  singleUserData,
  totalAbsent,
  getAllparticipantsList,
  downloadAllParticipantsList,
} = require("../controllers/userDetailsController");
const {
  adminRegister,
  verifyEmail,
  canteenRegister,
  adminLogin,
  getAdminJwtToken,
  resetPassword,
} = require("../controllers/loginController");
const authValidation = require("../validation/auth.validation.js");
const participantValidation = require("../validation/participant.validation.js");
const eventValidation = require("../validation/event.validation.js");
const canteenValidation = require("../validation/canteen.validation.js");
const { getMenu, getCanteen } = require("../controllers/canteenController");
const validate = require("../middleware/validation.js");
const { verifyJwt, authorizeAdmin } = require("../middleware/verifyJwt");
const multerUpload = require("../middleware/multer");
const {
  getAllMemberDetails,
  deleteMemberAccount,
  getProfileDetails,
  updateMemberDetails,
} = require("../controllers/memberController");

const router = express.Router();

router.post(
  "/signup",
  verifyJwt,
  validate(authValidation.adminRegisterSchema),
  adminRegister
);

router.post("/login", validate(authValidation.adminLoginSchema), adminLogin);

router.patch(
  "/resetpassword",
  verifyJwt,
  authorizeAdmin,
  validate(authValidation.resetPasswordAdminSchema),
  resetPassword
);

router.get("/getjwttoken", getAdminJwtToken);

router.get(
  "/getallmemberdetails",
  verifyJwt,
  authorizeAdmin,
  getAllMemberDetails
);

router.delete("/deletemember", verifyJwt, authorizeAdmin, deleteMemberAccount);

router.post(
  "/uploadSheet",
  verifyJwt,
  authorizeAdmin,
  multerUpload,
  uploadSheet
);

router.get(
  "/getalluserdetails",
  verifyJwt,
  authorizeAdmin,
  validate(participantValidation.getAllUserDetailsSchema),
  getAllUserDetails
);
router.get(
  "/getallparticipantslist",
  verifyJwt,
  authorizeAdmin,
  getAllparticipantsList
);
router.get("/getprofile", verifyJwt, authorizeAdmin, getProfileDetails);
router.get(
  "/downloadallparticipantslist",
  verifyJwt,
  authorizeAdmin,
  downloadAllParticipantsList
);

router.get(
  "/getuserdetails",
  verifyJwt,
  authorizeAdmin,
  validate(participantValidation.getUserDetailsSchema),
  getuserDetails
);
router.patch(
  "/memberdetails",
  verifyJwt,
  authorizeAdmin,
  validate(participantValidation.updateMemberDetailSchema),
  updateMemberDetails
);

router.post(
  "/singleuserdata",
  verifyJwt,
  validate(authValidation.userRegisterSchema),
  authorizeAdmin,
  singleUserData
);

router.put(
  "/markpresence",
  verifyJwt,
  authorizeAdmin,
  validate(participantValidation.markPresenceSchema),
  markpresence
);

router.get(
  "/geteventreport",
  verifyJwt,
  authorizeAdmin,
  validate(eventValidation.eventReportSchema),
  getEventReport
);

router.delete(
  "/deleteevent",
  verifyJwt,
  authorizeAdmin,
  validate(eventValidation.eventDeleteSchema),
  deleteEvent
);

router.get("/totalabsent", verifyJwt, authorizeAdmin, totalAbsent);

router.post(
  "/createevent",
  verifyJwt,
  authorizeAdmin,
  validate(authValidation.eventRegisterSchema),
  createEvent
);

router.get("/getevent", verifyJwt, authorizeAdmin, getEvent);

router.get("/getcanteen", verifyJwt, authorizeAdmin, getCanteen);

router.post(
  "/createcanteen",
  verifyJwt,
  validate(authValidation.canteenRegisterSchema),
  authorizeAdmin,
  canteenRegister
);

router.get(
  "/getmenu",
  verifyJwt,
  authorizeAdmin,
  validate(canteenValidation.getMenuSchema),
  getMenu
);

module.exports = router;
