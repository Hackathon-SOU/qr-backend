const jwt = require("jsonwebtoken");
const volunteerData = require("../models/member");
const userData = require("../models/user");

function verifyJwt(req, res, next) {
  try {
    console.log(req.query.token);
    jwt.verify(req.query.token, process.env.ACCESSSECRET, function (err, decoded) {
      if (err) {
        console.log("errrr", err);
        res.status(500).send(err);
      } else {
        console.log(decoded.id);
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
  console.log(volunteerId);
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
  user?  next():  res.status(500).send("Oops, it seems you are not part of IEEE.");
}


async function authorizeCanteen(req, res, next){
  const participantId= req.id;
  let user = await userData.findOne({
    _id: participantId,
  });
  user?  next():  res.status(500).send("Oops, it seems you are not part of IEEE.");
}
module.exports = {verifyJwt, authorizeAdmin, authorizeParticpant, authorizeCanteen};