const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const volunteerData = require("../models/member");
const userData = require("../models/user");
const canteenData = require("../models/canteen");

// For Admin register 
const adminRegister = async (req, res, next) => {
  try {
    const {
      role,
      email,
      password,
      name,
      membershipId
    } = req.body;
    // console.log(membershipId, password, role, email);
    await bcrypt.hash(password, 10).then((hash) => {
      password = hash;
    });
    const data = await volunteerData.create({
      password: password,
      email: email,
      membershipId: membershipId,
      role: role,
      name: name,
    });
    data && res.send({
      message: "Account has been created"
    });
  } catch (error) {
    console.log("error===>", error);
    if (error.keyPattern.email) {
      res.status(500).send({
        message: "Duplicate Email was found"
      });
    } else if (error.keyPattern.membershipId) {
      console.log(error.message);
      res.status(500).send({
        message: "Account for these Membership Id has already been created"
      });
    } else {
      res.send(error.message);
    }
  }
}

const canteenRegister = async (req, res, next) => {
  try {
    const canteenName = req.body.canteenName;
    const ownerName = req.body.ownerName;
    const phoneNo = req.body.phoneNo;
    let email = req.body.email;
    let password = req.body.password;
    // console.log(password, email);
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
    data && res.send("Account has been created");
  } catch (error) {
    console.log(error, "11");
    if (error.keyPattern.email) {
      return res.status(500).send("Duplicate Email was found");
    } else if (error.keyPattern.phonNo) {
      console.log(error.message);
      return res.status(500).send("Account for these Phone Number has already been created");
    } else {
      return res.send(error.message);
    }
  }
}

// For Admin login

const adminLogin = async (req, res) => {
  try {
    const membershipId = req.body.membershipId;
    const password = req.body.password;
    console.log("membershipId====>", membershipId)
    console.log("password====>", typeof (password))
    const admin = await volunteerData.findOne({
      membershipId: membershipId,
    });
    if ((admin)) {
      console.log("found admin in DB");
      bcrypt.compare(
        password,
        admin.password,
        async function (error, isMatch) {
          if (error) {
            console.log("errror====>", error);
            res.status(500).send({
              message: error.message
            });
          } else if (!isMatch) {
            res.status(401).json({
              message: "The password does not match with the Membership Id",
            });
          } else {
            let accessToken = jwt.sign({
                id: admin._id,
                role: admin.role,
                membershipId: admin.membershipId,
              },
              process.env.ACCESSSECRET, {
                expiresIn: 60 * 60
              });
            let refreshToken = jwt.sign({
                membershipId: admin.membershipId,
              },
              process.env.REFRESHSECRET);

            res.status(200).send({
              accessToken: accessToken,
              refreshToken: refreshToken
            });
          }
        }
      );
    } else {
      res.status(401).json({
        message: "You have entered wrong Membership Id"
      });
    }
  } catch (error) {
    console.log("api error===>", error);
    res.status(400);
    res.send({
      message: 'You made a BAD request'
    });
  }
}

const canteenLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email, password, "15");
    if (email == undefined || email.length == 0 || password == undefined || password.length == 0) {
      res.status(404).send({
        message: "Credentials Not Found"
      });
    } else {
      const canteenUser = await canteenData.findOne({
        email: email,
      });
      if (canteenUser) {
        bcrypt.compare(
          password,
          canteenUser.password,
          async function (err, isMatch) {
            if (err) {
              console.log(err, "25");
              res.status(500).send({
                message: err.message
              });
            } else if (!isMatch) {
              res.status(401).send({
                message: "The password does not match with the Email",
              });
            } else {
              console.log(canteenUser.email);

              let accessToken = jwt.sign({
                  id: canteenUser._id,
                  email: canteenUser.email,
                },
                process.env.ACCESSSECRET, {
                  expiresIn: 60 * 60
                });
              let refreshToken = jwt.sign({
                  phoneNo: canteenUser.phoneNo,
                },
                process.env.REFRESHSECRET);

              res.send({
                accessToken: accessToken,
                refreshToken: refreshToken
              });
              // res.send(resToken);
            }
          }
        );
      } else {
        res.status(401).send({
          message: "You have entered wrong Email Id"
        });
      }
    }
  } catch (err) {
    console.log("error====>", err);
    res.status(400).send({
      message: "You have made a BAD request"
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
    // console.log(participant);
    if (participant) {
      console.log("found participant in DB");
      if (participant.email == email) {
        let accessToken = jwt.sign({
            id: participant._id,
            regId: participant.regId,
          },
          process.env.ACCESSSECRET, {
            expiresIn: 60 * 60
          });
        let refreshToken = jwt.sign({
            regId: participant.regId,
          },
          process.env.REFRESHSECRET);

        res.send({
          accessToken: accessToken,
          refreshToken: refreshToken
        });
      } else {
        res.status(401).send({
          message: "Email does not match, check your email Id"
        })
      }
    } else {
      res.status(401).send({
        message: "Oops, it seems you are not particpant of the Event"
      });
    }
  } catch (err) {
    console.log("err", err);
    res.status(400).send({
      message: "You have made a BAD request"
    });
  }
}

const getAdminJwtToken = async (req, res) => {
  try {
    const membershipId = req.body.membershipId;
    let refreshToken;
    if (req.headers.authorization == undefined || null == req.headers.authorization) {
      res.status(404).send({
        message: "Please enter refresh Token"
      })
    } else if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
      refreshToken = req.headers.authorization.split(" ")[1];
      console.log("refreshToken==>", refreshToken);
      if (membershipId == undefined || membershipId == 0 || membershipId.length == 0) {
        res.status(404).send({
          message: "Credentials Not Found"
        });
      } else {
        jwt.verify(refreshToken, process.env.REFRESHSECRET, async function (error, decoded) {
          if (error) {
            console.log("errrr===>", error);
            res.status(500).send({
              message: error.message
            });
          } else {
            console.log(decoded);
            if (decoded.membershipId == membershipId) {
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
              res.send({
                accessToken: accessToken,
                refreshToken: refreshToken
              });
            } else {
              res.status(403).send({
                message: "You membership Id does not matched."
              })
            }
          }
        })

      }
    }
  } catch (error) {
    console.log("catch error==>", error);
    res.status(400).send({
      message: "You have made a BAD request."
    });
  }
}

const getParticipantJwtToken = async (req, res) => {
  try {
    const regId = req.body.regId;
    let refreshToken;
    if (req.headers.authorization == undefined || null == req.headers.authorization) {
      res.status(404).send({
        message: "Please enter Refresh Token"
      })
    } else if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
      refreshToken = req.headers.authorization.split(" ")[1];
      console.log("refreshToken==>", refreshToken);
      if (regId == undefined || regId.length == 0 || regId == 0) {
        res.status(404).send({
          message: "Credentials Not Found"
        });
      } else {
        jwt.verify(refreshToken, process.env.REFRESHSECRET, async function (error, decoded) {
          if (error) {
            console.log("errrr", error);
            res.status(401).send({
              message: error.message
            });
          } else {
            console.log(decoded);
            if (decoded.regId == regId) {
              const participant = await userData.findOne({
                regId: regId,
              });
              console.log("participant", participant);
              let accessToken = jwt.sign({
                  id: participant._id,
                  regId: participant.regId,
                },
                process.env.ACCESSSECRET, {
                  expiresIn: 60 * 60
                });
              res.send({
                accessToken: accessToken,
                refreshToken: refreshToken
              });
            } else {
              res.status(403).send({
                message: "You reg Id does not matched."
              })
            }
          }
        })

      }
    }
  } catch (error) {
    console.log("catch error==>", error);
    res.status(400).send({
      message: "you have made a BAD request"
    });
  }
}


const getCanteenJwtToken = async (req, res) => {
  try {
    const phoneNo = req.body.phoneNo;
    let refreshToken;

    if (req.headers.authorization == undefined || null == req.headers.authorization) {
      res.status(404).send({
        message: "Please enter Refresh Token"
      })
    } else if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
      refreshToken = req.headers.authorization.split(" ")[1];
      console.log("refreshToken==>", refreshToken);
      if (phoneNo == undefined || phoneNo == 0 || phoneNo.length == 0) {
        res.status(404).send({
          message: "Credentials Not Found"
        });
      } else {
        jwt.verify(refreshToken, process.env.REFRESHSECRET, async function (error, decoded) {
          if (error) {
            console.log("errrr", error);
            res.status(500).send({
              message: error.message
            });
          } else {
            console.log(decoded);
            if (decoded.phoneNo == phoneNo) {
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
              res.send({
                accessToken: accessToken,
                refreshToken: refreshToken
              });
            } else {
              res.status(403).send({
                message: "Your phone Number does not matched."
              })
            }
          }
        })

      }
    }
  } catch (error) {
    console.log("catch error==>", error);
    res.status(400).send("you have made a BAD request");
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