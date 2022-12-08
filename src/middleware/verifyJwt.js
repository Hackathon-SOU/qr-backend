const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");

const volunteerData = require("../models/member");
const userData = require("../models/user");
const canteenData = require("../models/canteen");
const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError");



function verifyJwt(req, res, next) {
  try {
    let token;
    if (req.headers.authorization == undefined || null == req.headers.authorization) {
      logger.error("Token is undefined or null");
      throw new ApiError(httpStatus.NOT_FOUND, 'Access Token not found');
    } else if (req.headers.authorization.split(" ")[0] == "Bearer") {
      token = req.headers.authorization.split(" ")[1];
      logger.debug("Token found successfully");
    }
    jwt.verify(token, process.env.ACCESSSECRET, function (error, decoded) {
      if (error) {
        logger.error("JWT verify error===> %o", error);
        throw new ApiError(httpStatus.UNAUTHORIZED, error.message)
      } else {
        logger.info("JWT decoded succesfully");
        req.id = decoded.id;
        return next();
      }
    });
  } catch (error) {
    logger.error("Verify JWT catch error====> %o", error)
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

async function authorizeAdmin(req, res, next) {
  const volunteerId = req.id;
  console.log("volunteerId==>", volunteerId);
  let admin = await volunteerData.findOne({
    _id: volunteerId,
  });
  if (Boolean(admin)) {
    logger.error("authorizeAdmin, Admin found succesfully");
    next();
  } else {
    res.status(403).send({
      message: "Oops, it seems you are not part of IEEE."
    });
    logger.error("authorizeAdmin, Admin does not found");
  }
}

async function authorizeParticpant(req, res, next) {
  const participantId = req.id;
  let user = await userData.findOne({
    _id: participantId,
  });
  req.userId = user._id;
  if (Boolean(user)) {
    logger.error("authorizeParticipant, Particpant found succesfully");
    next();
  } else {
    logger.error("authorizeParticipant, Particpant does not found");
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Oops, it seems you are not participant.');
  }
}


async function authorizeCanteen(req, res, next) {
  const canteenId = req.id;
  let canteen = await canteenData.findOne({
    _id: canteenId,
  });
  req.canteenId = canteen._id;
  if (Boolean(canteen)) {
    logger.info("authorizeCanteen, Canteen found successfully");
    next();
  } else {
    logger.error("authorizeCanteen, Canteen does not found");
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Oops, it seems you are not part of IEEE.');
  }
}

module.exports = {
  verifyJwt,
  authorizeAdmin,
  authorizeParticpant,
  authorizeCanteen
};