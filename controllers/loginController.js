const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const volunteerData = require("../models/member");
const userData = require("../models/user");

// For Admin register 
const adminRegister= async (req, res, next) =>{
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

// For Admin login

const adminLogin= async (req, res) =>{
  try {
    const membershipId = req.query.membershipId;
    const password = req.query.password;
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
            }
            if (!isMatch) {
              res.json({
                message: "The password does not match with the Membership Id",
              });
            } else {
              console.log(admin.membershipId);

              let accessToken=  jwt.sign({
                  id: admin._id,
                  role: admin.role,
                  membershipId: admin.membershipId,
                },
                process.env.ACCESSSECRET, {
                  expiresIn: 60 * 60
                });
              let refreshToken= jwt.sign({
                  membershipId: admin.membershipId,
                },
                process.env.REFRESHSECRET);

                res.send({ accessToken: accessToken, refreshToken: refreshToken});
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

const participantLogin= async (req, res) =>{
  try {
    const email= req.query.email;
    const regId = req.query.regId;
    const participant = await userData.findOne({
      regId: regId,
    });
    console.log(participant);
      if (participant) {
            if(participant.email== email){
              let accessToken=  jwt.sign({
                  id: participant._id,
                  role: participant.role,
                  membershipId: participant.membershipId,
                },
                process.env.ACCESSSECRET, {
                  expiresIn: 60 * 60
                });
              let refreshToken= jwt.sign({
                  membershipId: participant.membershipId,
                },
                process.env.REFRESHSECRET);
  
                res.send({ accessToken: accessToken, refreshToken: refreshToken});
            }else{
              res.send("Email does not match, check your email Id")
            }
      }else{
        res.send("Oops, it seems you are not particpant of the Event");
      }
  } catch (err) {
    console.log("err", err);
    res.send(err);
  }
}

const getAdminJwtToken= async(req,res)=>{
  try{
    const membershipId= req.query.membershipId;
    const refreshToken= req.query.refreshToken;
    jwt.verify(refreshToken, process.env.REFRESHSECRET, async function(error, decoded){
      if(error){

        console.log("errrr", error);
        res.status(500).send(error);

      }else{
        console.log(decoded);
        if(decoded.membershipId== membershipId){
          const admin = await volunteerData.findOne({
            membershipId: membershipId,
          });
          let accessToken=  jwt.sign({
            id: admin._id,
            role: admin.role,
            membershipId: admin.membershipId,
          },
          process.env.ACCESSSECRET, {
            expiresIn: 60 * 60
          });
          res.send({ accessToken: accessToken, refreshToken: refreshToken});
        }
      }
    })
  }catch(error){
    console.log("catch error==>", error);
    res.send(error);
  }
}

module.exports= {
    adminRegister,
    adminLogin,
    getAdminJwtToken,
    participantLogin
}