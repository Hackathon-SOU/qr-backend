const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");

const volunteerData = require("../models/member");
const userData = require("../models/user");
const canteenData = require("../models/canteen");
const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError");

const cookieOptions = {
  httOnly: true,
  secure: true,
  sameSite: "none",
};

const getAdminJwtToken = async (req, res, next) => {
  try {
    const cookies = req.headers.cookie.split("; ");
    const refreshToken = cookies[0].split("=")[1];
    if (!refreshToken)
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Refresh Token are undefined or null"
      );
    jwt.verify(
      refreshToken,
      process.env.REFRESHSECRET,
      async function (error, decoded) {
        if (error) return new ApiError(httpStatus.UNAUTHORIZED, error.message);
        const admin = await volunteerData.findOne({
          membershipId: decoded.membershipId,
        });
        if (!admin)
          return res.status(httpStatus.UNAUTHORIZED, "Member not found");
        const accessToken = jwt.sign(
          {
            id: admin._id,
            role: admin.role,
            membershipId: admin.membershipId,
          },
          process.env.ACCESSSECRET,
          {
            expiresIn: 60 * 60,
          }
        );
        req.id = admin._id;
        req.membershipId = admin.membershipId;
        req.role = admin.role;
        res.cookie("accessToken", accessToken, cookieOptions);
        res.cookie("refreshToken", refreshToken, cookieOptions);
        logger.info("Admin Refresh token generated Successfully");
        return next();
      }
    );
  } catch (error) {
    logger.error("Admin refresh jwt token catch error==> %o", error);
    return error;
  }
};
function verifyJwt(req, res, next) {
  try {
    const cookies = req.headers.cookie.split("; ");
    const accessToken = cookies[1].split("=")[1];
    if (!accessToken) {
      logger.error("Token is undefined or null");
      throw new ApiError(httpStatus.UNAUTHORIZED, "Access Token not found");
    }
    jwt.verify(
      accessToken,
      process.env.ACCESSSECRET,
      function (error, decoded) {
        if (error) {
          logger.error("JWT verify error===> %o", error);
          if (error.name === "TokenExpiredError")
            return getAdminJwtToken(req, res, next);
          throw new ApiError(httpStatus.UNAUTHORIZED, error.message);
        }
        logger.info("JWT decoded succesfully");
        req.id = decoded.id;
        req.membershipId = decoded.membershipId;
        req.role = decoded.role;
        return next();
      }
    );
  } catch (error) {
    logger.error("Verify JWT catch error====> %o", error);
    next(error);
  }
}

async function authorizeAdmin(req, res, next) {
  const volunteerId = req.id;
  let admin = await volunteerData.findOne({
    _id: volunteerId,
  });
  if (Boolean(admin)) {
    logger.debug("authorizeAdmin, Admin found succesfully");
    next();
  } else {
    res.status(403).send({
      message: "Oops, it seems you are not part of IEEE.",
    });
    logger.error("authorizeAdmin, Admin does not found");
  }
}

async function authorizeParticpant(req, res, next) {
  const participantId = req.id;
  let user = await userData.findOne({
    _id: participantId,
  });
  if (Boolean(user)) {
    req.userId = user._id;
    logger.error("authorizeParticipant, Particpant found succesfully");
    next();
  } else {
    logger.error("authorizeParticipant, Particpant does not found");
    next(
      new ApiError(
        httpStatus.UNAUTHORIZED,
        "Oops, it seems you are not participant."
      )
    );
  }
}

async function authorizeCanteen(req, res, next) {
  const canteenId = req.id;
  let canteen = await canteenData.findOne({
    _id: canteenId,
  });
  if (Boolean(canteen)) {
    req.canteenId = canteen._id;
    logger.info("authorizeCanteen, Canteen found successfully");
    next();
  } else {
    logger.error("authorizeCanteen, Canteen does not found");
    next(
      new ApiError(
        httpStatus.UNAUTHORIZED,
        "Oops, it seems you are not part of IEEE."
      )
    );
  }
}

module.exports = {
  verifyJwt,
  authorizeAdmin,
  authorizeParticpant,
  authorizeCanteen,
};
