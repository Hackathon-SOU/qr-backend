const jwt = require("jsonwebtoken");


function verifyJwt(req, res, next) {
  try {
    console.log(req.query.token);
    jwt.verify(req.query.token, process.env.SECRET, function (err, decoded) {
      if (err) {
        console.log("errrr", err);
        res.status(500).send(err);
      } else {
        req.volunteerId= decoded.id;
        return next();
      }
    });
  } catch (err) {
    console.log("err", err);
  }
};

module.exports = verifyJwt;