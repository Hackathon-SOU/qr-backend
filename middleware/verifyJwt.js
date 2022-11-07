const jwt = require("jsonwebtoken");
const volunteerData = require("../models/member");
const userData = require("../models/user");
const canteenData = require("../models/canteen");

function verifyJwt(req, res, next) {
  try {
    console.log(req.headers.authorization);
    let token;
    if(req.headers.authorization.split(" ")[0]== "Bearer"){
      token= req.headers.authorization.split(" ")[1];
    }
    jwt.verify(token, process.env.ACCESSSECRET, function (err, decoded) {
      if (err) {
        console.log("errrr", err);
        res.status(500).send(err);
      } else {
        console.log("decoded", decoded.id);
        req.id= decoded.id;
        return next();
      }
    });
  } catch (err) {
    console.log("err", err);
  }
};

async function authorizeAdmin(req, res, next){
  const volunteerId= req.id;
  console.log("volunteerId==>", volunteerId);
  let admin = await volunteerData.findOne({
    _id: volunteerId,
  });
  admin?  next():  res.status(500).send("Oops, it seems you are not part of IEEE.");
}

async function authorizeParticpant(req, res, next){
  const participantId= req.id;
  let user = await userData.findOne({
    _id: participantId,
  });
  console.log("userrrr", user);
  req.body.userId= user._id;
  user?  next():  res.status(500).send("Oops, it seems you are not participant.");
}


async function authorizeCanteen(req, res, next){
  const canteenId= req.id;
  let canteen = await canteenData.findOne({
    _id: canteenId,
  });
  req.body.canteenId= canteen._id;
  canteen?  next():  res.status(500).send("Oops, it seems you are not a registered Canteen Owner.");
}
module.exports = {verifyJwt, authorizeAdmin, authorizeParticpant, authorizeCanteen};