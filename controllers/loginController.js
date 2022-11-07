const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const volunteerData = require("../models/member");
const userData = require("../models/user");
const canteenData = require("../models/canteen");

// For Admin register 
const adminRegister = async (req, res, next) => {
  try {
    const membershipId = req.body.membershipId;
    let password = await req.body.password;
    const email = req.body.email;
    const role = req.body.role;
    //   console.log(req.body);
    console.log(membershipId, password, role, email);
    await bcrypt.hash(password, 10).then((hash) => {
      password = hash;
    });
    console.log(password);
    const data = new volunteerData({
      password: password,
      email: email,
      membershipId: membershipId,
      role: role,
    });
    const dataToSave = await data.save();
    console.log(dataToSave);
    return res.send({
      message: "Account has been created"
    });
  } catch (error) {
    console.log(error, "11");
    if (error.keyPattern.email) {
      return res.status(500).send({
        message: "Duplicate Email was found",
      });
    } else if (error.keyPattern.membershipId) {
      console.log(error.message);
      return res.status(500).send({
        message: "Account for these Membership Id has already been created",
      });
    } else {
      return res.send(error.message);
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
    //   console.log(req.body);
    console.log(password, email);
    await bcrypt.hash(password, 10).then((hash) => {
      password = hash;
    });
    console.log(password);
    const data = await canteenData.create({
      password: password,
      email: email,
      canteenName: canteenName,
      ownerName: ownerName,
      phoneNo: phoneNo
    });
    const dataToSave = await data.save();
    console.log(dataToSave);
    return res.send({
      message: "Account has been created"
    });
  } catch (error) {
    console.log(error, "11");
    if (error.keyPattern.email) {
      return res.status(500).send({
        message: "Duplicate Email was found",
      });
    } else if (error.keyPattern.phonNo) {
      console.log(error.message);
      return res.status(500).send({
        message: "Account for these Phone Number has already been created",
      });
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
    console.log(membershipId, password, "15");
    const admin = await volunteerData.findOne({
      membershipId: membershipId,
    });
    if (admin) {
      bcrypt.compare(
        password,
        admin.password,
        async function (err, isMatch) {
          if (err) {
            console.log(err, "25");
            res.send(err);
          } else if (!isMatch) {
            res.json({
              message: "The password does not match with the Membership Id",
            });
          } else {
            console.log(admin.membershipId);

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

            res.send({
              accessToken: accessToken,
              refreshToken: refreshToken
            });
            // res.send(resToken);
          }
        }
      );
    } else {
      res.json({
        message: "You have entered wrong Membership Id"
      });
    }
  } catch (err) {
    console.log("err", err);
    res.send(err);
  }
}
const canteenLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email, password, "15");
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
            res.send(err);
          } else if (!isMatch) {
            res.json({
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
      res.json({
        message: "You have entered wrong Membership Id"
      });
    }
  } catch (err) {
    console.log("err", err);
    res.send(err);
  }
}

const participantLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const regId = req.body.regId;
    const participant = await userData.findOne({
      regId: regId,
    });
    console.log(participant);
    if (participant) {
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
        res.send("Email does not match, check your email Id")
      }
    } else {
      res.send("Oops, it seems you are not particpant of the Event");
    }
  } catch (err) {
    console.log("err", err);
    res.send(err);
  }
}

const getAdminJwtToken = async (req, res) => {
  try {
    const membershipId = req.body.membershipId;
    let refreshToken;
    if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
      refreshToken = req.headers.authorization.split(" ")[1];
    }
    console.log("refreshToken==>", refreshToken);

    jwt.verify(refreshToken, process.env.REFRESHSECRET, async function (error, decoded) {
      if (error) {
        console.log("errrr", error);
        res.status(500).send(error);
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
        }
      }
    })

  } catch (error) {
    console.log("catch error==>", error);
    res.send(error);
  }
}

const getParticipantJwtToken = async (req, res) => {
  try {
    const regId = req.body.regId;
    let refreshToken;
    if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
      refreshToken = req.headers.authorization.split(" ")[1];
    }
    console.log("refreshToken==>", refreshToken);

    jwt.verify(refreshToken, process.env.REFRESHSECRET, async function (error, decoded) {
      if (error) {
        console.log("errrr", error);
        res.status(500).send(error);
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
        }
      }
    })

  } catch (error) {
    console.log("catch error==>", error);
    res.send(error);
  }
}
const getCanteenJwtToken = async (req, res) => {
  try {
    const phoneNo = req.body.phoneNo;
    let refreshToken;
    if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
      refreshToken = req.headers.authorization.split(" ")[1];
    }
    console.log("refreshToken==>", refreshToken);

    jwt.verify(refreshToken, process.env.REFRESHSECRET, async function (error, decoded) {
      if (error) {
        console.log("errrr", error);
        res.status(500).send(error);
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
        }
      }
    })

  } catch (error) {
    console.log("catch error==>", error);
    res.send(error);
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