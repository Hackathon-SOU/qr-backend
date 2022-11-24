const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const volunteerData = require("../models/member");
const userData = require("../models/user");
const canteenData = require("../models/canteen");
const logger = require("../utils/logger");

// Code for registering user
const adminRegister = async (req, res, next) => {
  try {
    const {
      role,
      email,
      name,
      membershipId
    } = req.body;
    let password = req.body.password;
    await bcrypt.hash(password, 10).then((hash) => {
      password = hash;
    });
    const data = await volunteerData.create({
      password,
      email,
      membershipId,
      role,
      name,
    });
    logger.debug("%s", Boolean(data));
    if (Boolean(data)) {
      res.sendStatus(200).send({
        message: "Account has been created"
      });
      logger.info("Admin account created Successfully");
    }
  } catch (error) {
    if (error.keyPattern.email) {
      res.sendStatus(409).send({
        message: "Duplicate Email was found"
      });
      logger.error("Admin,  Duplicate Email found");
    } else if (error.keyPattern.membershipId) {
      res.sendStatus(409).send({
        message: "Account for these Membership Id has already been created"
      });
      logger.error("Admin,  Duplicate MembershipId found");
    } else {
      logger.error("Admin,  register catch error===> %o", error);
      res.sendStatus(500).send({
        message: error.message
      });
    }
  }
}

const canteenRegister = async (req, res, next) => {
  try {
    const {
      canteenName,
      ownerName,
      phoneNo,
      email
    } = req.body;
    let password = req.body.password;
    await bcrypt.hash(password, 10).then((hash) => {
      password = hash;
    });
    const data = await canteenData.create({
      password: password,
      email: email,
      canteenName: canteenName,
      ownerName: ownerName,
      phoneNo: phoneNo
    });
    if (Boolean(data)) {
      res.send({
        message: "Account has been created"
      });
      logger.info("Canteen account created Successfully");
    }
  } catch (error) {
    if (error.keyPattern.canteenName) {
      logger.error("Canteen,  Duplicate canteen Name found");
      return res.sendStatus(409).send({
        message: "Duplicate Canteen name was found"
      });
    } else if (error.keyPattern.email) {
      logger.error("Canteen,  Duplicate Email found");
      return res.sendStatus(409).send({
        message: "Duplicate Email was found"
      });
    } else if (error.keyPattern.phoneNo) {
      logger.error("Canteen,  Duplicate Phone Number found");
      return res.sendStatus(409).send({
        message: "Account for these Phone Number has already been created"
      });
    } else {
      logger.error("Canteen,  register catch error===> %o", error);
      return res.sendStatus(500).send({
        message: error.message
      });
    }
  }
}

// Code for login system

const adminLogin = async (req, res) => {
  try {
    const membershipId = req.body.membershipId;
    const password = req.body.password;
    const admin = await volunteerData.findOne({
      membershipId: membershipId,
    });
    if ((admin)) {
      logger.debug("found admin in DB");
      bcrypt.compare(
        password,
        admin.password,
        async function (error, isMatch) {
          if (error) {
            logger.error("admin login password match errror====> %o", error);
            res.sendStatus(500).send({
              message: error.message
            });
          } else if (!isMatch) {
            res.sendStatus(403).json({
              message: "The password does not match with the Membership Id",
            });
            logger.error("The password does not match with the Membership Id");

          } else {
            let accessToken = jwt.sign({
                id: admin._id,
                role: admin.role,
                membershipId: admin.membershipId,
              },
              process.env.ACCESSSECRET, {
                expiresIn: 14400000
              });
            let refreshToken = jwt.sign({
                membershipId: admin.membershipId,
              },
              process.env.REFRESHSECRET);

            res.sendStatus(200).send({
              accessToken: accessToken,
              refreshToken: refreshToken
            });
            logger.info(`Admin has been loggedIn Successfully `)
          }
        }
      );
    } else {
      res.sendStatus(403).json({
        message: "You have entered wrong Membership Id"
      });
      logger.error("Admin have entered wrong Membership Id");

    }
  } catch (error) {
    logger.error("Admin login catch error===> %o", error);
    res.sendStatus(400).send({
      message: 'You made a BAD request',
      errorMessage: error.message,
    });
  }
}

const canteenLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const canteenUser = await canteenData.findOne({
      email: email,
    });
    if (Boolean(canteenUser)) {
      bcrypt.compare(
        password,
        canteenUser.password,
        async function (err, isMatch) {
          if (err) {
            logger.error("Canteen password bycrypt error====> %o", err);
            res.sendStatus(500).send({
              message: err.message
            });
          } else if (!isMatch) {
            res.sendStatus(403).send({
              message: "The password does not match with the Email",
            });
            logger.error("The password does not match with the Email");
          } else {
            let accessToken = jwt.sign({
                id: canteenUser._id,
                email: canteenUser.email,
              },
              process.env.ACCESSSECRET, {
                expiresIn: 14400000
              });
            let refreshToken = jwt.sign({
                phoneNo: canteenUser.phoneNo,
              },
              process.env.REFRESHSECRET);

            res.sendStatus(200).send({
              accessToken: accessToken,
              refreshToken: refreshToken
            });
            logger.info("canteen user has successfully loggedIn");

          }
        }
      );
    } else {
      res.sendStatus(401).send({
        message: "You have entered wrong Email Id"
      });
      logger.error("You have entered wrong Email Id");
    }
  } catch (err) {
    logger.error("Canteen login catch error====> %o", err);
    res.sendStatus(400).send({
      message: "You have made a BAD request",
      errorMessage: error.message
    });
  }
}

const participantLogin = async (req, res) => {
  try {
    const {
      email,
      regId
    } = req.body;
    const participant = await userData.findOne({
      regId: regId,
    });
    logger.debug("participant data ====> %s", participant);
    if (Boolean(participant)) {
      logger.debug("found participant in DB");
      if (participant.email == email) {
        let accessToken = jwt.sign({
            id: participant._id,
            regId: participant.regId,
          },
          process.env.ACCESSSECRET, {
            expiresIn: 14400000
          });
        let refreshToken = jwt.sign({
            regId: participant.regId,
          },
          process.env.REFRESHSECRET);

        logger.info("Participant has successfully LoggedIn")
        res.status(200).send({
          accessToken: accessToken,
          refreshToken: refreshToken
        });
      } else {
        res.sendStatus(403).send({
          message: "Email does not match, check your email Id"
        })
        logger.error("Email does not match, check your email Id");
      }
    } else {
      res.sendStatus(403).send({
        message: "Oops, it seems you are not particpant of the Event"
      });
      logger.error("Participant's regId not found in the Event");

    }
  } catch (err) {
    logger.error("participant login error in catch ===> %o", err);
    res.sendStatus(400).send({
      message: "You have made a BAD request",
      errorMessage: err.message,
    });
  }
}


// get JWT token from Refresh token

const getAdminJwtToken = async (req, res) => {
  try {
    const membershipId = req.body.membershipId;
    let refreshToken;
    if (req.headers.authorization == undefined || null == req.headers.authorization) {
      res.sendStatus(404).send({
        message: "Please enter refresh Token"
      });
      logger.error("RefreshToken, Admin Token undefined or null ");

    } else if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
      refreshToken = req.headers.authorization.split(" ")[1];
      logger.debug("RefreshToken, Admin refreshToken found successfully");
      if (membershipId == undefined || membershipId == 0 || membershipId.length == 0) {
        res.sendStatus(404).send({
          message: "MembershipId are undefined or null"
        });
        logger.error("RefreshToken, Admin  Membership Id is undefined or null");
      } else {
        jwt.verify(refreshToken, process.env.REFRESHSECRET, async function (error, decoded) {
          if (error) {
            logger.error("RefreshToken, Admin refresh token jwt verify errrr===> %o", error);
            res.sendStatus(500).send({
              message: error.message
            });
          } else {
            if (decoded.membershipId == membershipId) {
              logger.debug("RefreshToken, Admin  Membership Id matched");
              const admin = await volunteerData.findOne({
                membershipId: membershipId,
              });
              let accessToken = jwt.sign({
                  id: admin._id,
                  role: admin.role,
                  membershipId: admin.membershipId,
                },
                process.env.ACCESSSECRET, {
                  expiresIn: 60 * 60
                });
              res.sendStatus(200).send({
                accessToken: accessToken,
                refreshToken: refreshToken
              });
              logger.info("Admin Refresh token generated Successfully");
            } else {
              res.sendStatus(403).send({
                message: "You membership Id does not matched with token"
              })
              logger.error("RefreshToken, Admin Membership Id does not match with token.");
            }
          }
        })

      }
    }
  } catch (error) {
    logger.error("Admin refresh jwt token catch error==> %o", error);
    res.sendStatus(400).send({
      message: "You have made a BAD request.",
      errorMessage: error.message
    });
  }
}

const getParticipantJwtToken = async (req, res) => {
  try {
    const regId = req.body.regId;
    let refreshToken;
    if (req.headers.authorization == undefined || null == req.headers.authorization) {
      res.sendStatus(404).send({
        message: "Please enter Refresh Token"
      })
      logger.error("RefreshToken, Participant refresh Token undefined or null ");
    } else if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
      refreshToken = req.headers.authorization.split(" ")[1];
      logger.debug("RefreshToken participant found");
      if (regId == undefined || regId.length == 0 || regId == 0) {
        res.sendStatus(404).send({
          message: "Registration is undefined or null"
        });
        logger.error("Refresh Token, Participant Reg. Id is undefined or null");

      } else {
        jwt.verify(refreshToken, process.env.REFRESHSECRET, async function (error, decoded) {
          if (error) {
            logger.error("Refresh Token, Participant refreshtoken jwt verify errrr===> %o", error);
            res.sendStatus(401).send({
              message: error.message
            });
          } else {
            if (decoded.regId == regId) {
              logger.debug("Refresg token, Participant Reg. Id matched");
              const participant = await userData.findOne({
                regId: regId,
              });
              let accessToken = jwt.sign({
                  id: participant._id,
                  regId: participant.regId,
                },
                process.env.ACCESSSECRET, {
                  expiresIn: 60 * 60
                });
              res.sendStatus(200).send({
                accessToken: accessToken,
                refreshToken: refreshToken
              });
              logger.info("Participant Refresh token generated Successfully");
            } else {
              res.sendStatus(403).send({
                message: "You reg Id does not matched."
              })
              logger.error("Refresh token, Participant  Reg. Id does not match with token.");
            }
          }
        })

      }
    }
  } catch (error) {
    logger.error("Refresh token, Participant jwt token catch error==> %o", error);
    res.sendStatus(400).send({
      message: "you have made a BAD request"
    });
  }
}


const getCanteenJwtToken = async (req, res) => {
  try {
    const phoneNo = req.body.phoneNo;
    let refreshToken;

    if (req.headers.authorization == undefined || null == req.headers.authorization) {
      res.sendStatus(404).send({
        message: "Please enter Refresh Token"
      });
      logger.error("Refresh token, Canteen refresh Token undefined or null ");
    } else if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
      refreshToken = req.headers.authorization.split(" ")[1];
      logger.debug("RefreshToken Canteen found");
      if (phoneNo == undefined || phoneNo == 0 || phoneNo.toString().length == 0) {
        res.sendStatus(404).send({
          message: "Phone Number is undefined or null"
        });
        logger.error("Canteen phoneNo is undefined or null");
      } else if (phoneNo.toString().length !== 10) {
        res.sendStatus(400).send({
          message: "Please Enter phone Number of 10 digits"
        });
        logger.info("Phone number is not of 10 digits");
      } else {
        jwt.verify(refreshToken, process.env.REFRESHSECRET, async function (error, decoded) {
          if (error) {
            logger.error("refresh token, Canteen jwt verify errrr===> %o", error);
            res.sendStatus(401).send({
              message: error.message
            });
          } else {
            if (decoded.phoneNo == phoneNo) {
              logger.debug("Refresh token, Canteen phoneNo matched");
              const canteenUser = await canteenData.findOne({
                phoneNo: phoneNo,
              });
              let accessToken = jwt.sign({
                  _id: canteenUser._id,
                  email: canteenUser.email,
                },
                process.env.ACCESSSECRET, {
                  expiresIn: 60 * 60
                });
              res.sendStatus(200).send({
                accessToken: accessToken,
                refreshToken: refreshToken
              });
              logger.info("Canteen Refresh token generated Successfully");
            } else {
              res.sendStatus(403).send({
                message: "Your phone Number does not matched."
              })
              logger.error("Refresh token, Canteen  phoneNo does not match with token.");

            }
          }
        })

      }
    }
  } catch (error) {
    logger.error("Refresh token, Canteen jwt token catch error==> %o", error);
    res.sendStatus(400).send("you have made a BAD request");
  }
}

module.exports = {
  adminRegister,
  adminLogin,
  getAdminJwtToken,
  canteenLogin,
  getCanteenJwtToken,
  participantLogin,
  getParticipantJwtToken,
  canteenRegister

}