const jwt = require("jsonwebtoken");
const volunteerData = require("../models/member");
const userData = require("../models/user");
const canteenData = require("../models/canteen");

function verifyJwt(req, res, next) {
  try {
    console.log(req.headers.authorization);
    let token;
    if (req.headers.authorization == undefined || null == req.headers.authorization) {
      res.status(401).send({
        message: "Please enter Access Token"
      })
    } else if (req.headers.authorization.split(" ")[0] == "Bearer") {
      token = req.headers.authorization.split(" ")[1];
    }
    jwt.verify(token, process.env.ACCESSSECRET, function (error, decoded) {
      if (error) {
        console.log("errrr", error);
        error.message
        res.status(401).send({
          message: error.message
        });
      } else {
        console.log("decoded", decoded.id);
        req.id = decoded.id;
        return next();
      }
    });
  } catch (error) {
    console.log(error);
    console.log("error===>", error.message);
  }
};

async function authorizeAdmin(req, res, next) {
  const volunteerId = req.id;
  console.log("volunteerId==>", volunteerId);
  let admin = await volunteerData.findOne({
    _id: volunteerId,
  });
  admin ? next() : res.status(403).send({
    message: "Oops, it seems you are not part of IEEE."
  });
}

async function authorizeParticpant(req, res, next) {
  const participantId = req.id;
  let user = await userData.findOne({
    _id: participantId,
  });
  console.log("userrrr", user);
  req.userId = user._id;
  user ? next() : res.status(403).send({
    message: "Oops, it seems you are not participant."
  });
}


async function authorizeCanteen(req, res, next) {
  const canteenId = req.id;
  let canteen = await canteenData.findOne({
    _id: canteenId,
  });
  req.canteenId = canteen._id;
  canteen ? next() : res.status(403).send({
    message: "Oops, it seems you are not a registered Canteen Owner."
  });
}
module.exports = {
  verifyJwt,
  authorizeAdmin,
  authorizeParticpant,
  authorizeCanteen
};