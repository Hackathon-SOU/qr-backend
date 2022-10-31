const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const multer = require("multer");
var path = require("path");
const render = require("xlsx");
require("dotenv");
const jwt = require("jsonwebtoken");
const userData = require("../models/user");


const getuserDetails= async (req, res) => {
  const regId = req.query.regId;
  console.log(regId);
  try {
    await userData.find({
      regId: regId
    }).then((existingUser) => {
      console.log(existingUser);
      if (existingUser[0].present === true) {
        // res.send(existingUser);
        return res
          .status(500)
          .send(
            "The person is already marked present. Please check your Registration Id."
          );
      } else {
        return res.send(existingUser);
      }
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send(
        "There is no such Particpant here. Please check your Registration Id"
      );
  }
}

const markpresence= async(req, res) => {
  const regId = req.body.regId;
  const present = req.body.present;
  console.log(regId);
  console.log(present);
  try {
    const response = await userData.updateOne({
      regId: regId
    }, {
      $set: {
        present: present,
      },
    });
    console.log(response);
    if(response.acknowledged=== true){
        res.send("Marked as Present");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

const singleUserData= async (req, res) => {
  const name = req.query.name;
  const email = req.query.email;
  const regId = req.query.regId;
  const seatNo = req.query.seatNo;
  const present = req.query.present;

  const data = new userData({
    name: name,
    email: email,
    regId: regId,
    seatNo: seatNo,
    present: present,
  });
  try {
    const dataToSave = await data.save();
    return res.send("User Added Successfully");
  } catch (error) {
    console.log(error);
  }
};

const totalAbsent = async(req, res)=>{
    try {
    userData.count({
      present: false
    }, function (err, numofDocs) {
      if (err) {
        res.status(500).send(err);
        console.log(err);
      }
      console.log(numofDocs);
      res.status(200).send({
        count: numofDocs
      });
    });
  } catch (err) {
    console.log(err);
  }
}
module.exports={
    getuserDetails,
    markpresence,
    singleUserData,
    totalAbsent
}