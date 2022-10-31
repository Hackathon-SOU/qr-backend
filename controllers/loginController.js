const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const multer = require("multer");
var path = require("path");
const render = require("xlsx");
require("dotenv");
const jwt = require("jsonwebtoken");
const volunteerData = require("../models/member");



// For register Page
const registerView= async (req, res, next) =>{
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

// For login

const loginView= async (req, res) =>{
  try {
    const membershipId = req.query.membershipId;
    const password = req.query.password;
    console.log(membershipId, password, "15");
    const response = await volunteerData.findOne({
      membershipId: membershipId,
    }).then((existingUser, err) => {
      if (existingUser) {
        bcrypt.compare(
          password,
          existingUser.password,
          function (err, isMatch) {
            if (err) {
              console.log(err, "25");
              res.send(err);
            }
            if (!isMatch) {
              return res.json({
                message: "The password does not match with the Membership Id",
              });
            } else {
              console.log(existingUser.membershipId);

              jwt.sign({
                  id: existingUser._id,
                  role: existingUser.role,
                  membershipId: existingUser.membershipId,
                },
                process.env.SECRET, {
                  expiresIn: 60 * 60
                },
                (err, token) => {
                  if (err) {
                    console.log(err, "43");
                    res.send(err);
                  }
                  // console.log(token);
                  res.status(200).send(token);
                }
              );
            }
          }
        );
      } else {
        res.json({
          message: "You have entered wrong Membership Id"
        });
      }
    });
  } catch (err) {
    console.log("err", err);
    res.send(err);
  }
}

module.exports= {
    registerView,
    loginView
}