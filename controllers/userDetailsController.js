const userData = require("../models/user");
const render = require("xlsx");
// const mongoose = require("mongoose");
const fs = require("fs");

const getuserDetails = async (req, res, next) => {
    try {
        const regId = req.body.regId;
        console.log("regID", regId);
        let resultUser = await userData.findOne({
            regId: regId
        }, {
            _id: 0,
            __v: 0
        });
        console.log("resultUser===>", resultUser);
        if (!resultUser) {
            res.status(403).send({
                message: "Oops, you registration Id does not match. Please check your registration Id."
            })
        } else if (resultUser.present === true) {
            return res
                .status(403)
                .send({
                    message: "The person is already marked present. Please check your Registration Id."
                });
        } else {
            return res.status(200).send(resultUser);
        }

    } catch (error) {
        console.log(error);
        res
            .status(500)
            .send({
                message: error.message
            });
    }
};

const getAllUserDetails = async (req, res, next) => {
    try {
        const eventId = req.body.eventId;
        const volunteerId = req.volunteerId;
        console.log("eventId===>", eventId);
        const resultUsers = await userData.find({
            eventId: eventId
        }, {
            _id: 0,
            __v: 0
        });
        // console.log(resultUsers);
        if (!resultUsers) {
            res.status(404).send({
                message: "No participant found. Please add participant in your event",
            })
        } else if (resultUsers) {
            res.status(200).send(resultUsers);
        }
    } catch (error) {
        console.log("catch error==>", error);
        res.status(500).send({
            message: error.message
        })
    }

};

const markpresence = async (req, res) => {
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
        if (response.matchedCount == 1) {
            res.status(404).send({
                message: "Participant not found"
            });
        }
        if (response.modifiedCount == 1) {
            if (response.acknowledged === true) {
                res.status(200).send({
                    message: "Marked as Present"
                });
            }
        } else {
            res.status(403).send({
                message: "Participant already present"
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: error.message
        });
    }
};

const singleUserData = async (req, res) => {
    try {
        const {
            name,
            email,
            regId,
            seatNo,
            present,
            eventId
        } = req.body;

        const data = await userData.create({
            name: name,
            email: email,
            regId: regId,
            seatNo: seatNo,
            present: present,
            eventId: eventId,
        });

        if (data) {
            console.log("data==>", data);
            res.status(200).send({
                message: "User Added Successfully"
            });
        }
    } catch (error) {
        console.log("errr", error);
        error.code == 11000 ?
            Object.keys(error.keyPattern) == "email" ?
            res.status(409).send({
                message: "You have already registered with this email"
            }) :
            Object.keys(error.keyPattern) == "regId" ?
            res.status(409).send({
                message: "You have already registered with this regId"
            }) :
            Object.keys(error.keyPattern) == "seatNo" &&
            res.status(409).send({
                message: "Oops this seat already reserved. Please Check your SeatNo"
            }) :
            res.status(500).send(error);
        // }
    }
};

const totalAbsent = async (req, res) => {
    try {
        userData.count({
            present: false
        }, function (err, numofDocs) {
            if (err) {
                res.status(500).send({
                    message: err.message
                });
                console.log(err);
            }
            console.log(numofDocs);
            res.status(200).send({
                count: numofDocs
            });
        });
    } catch (err) {
        console.log({
            message: err.message
        });
        res.status(500).send({
            message: err.message
        })
    }
};

const uploadSheet = async (req, res, next) => {
    try {
        // Below code is to upload Sheet from    
        const eventId = req.query.eventId;
        console.log("eventId", eventId);
        let fileName = req.fileName;
        console.log("fileName===>", fileName)
        var file = render.readFile(`./uploads/${fileName}`);
        const sheet = file.SheetNames;
        for (var i = 0; i < sheet.length; i++) {
            var sheetName = sheet[i];
            const sheetData = render.utils.sheet_to_json(file.Sheets[sheetName]);
            // console.log(sheetData);
            var documentCount;
            var totalData;
            var sheetCount = 0;
            userData.count({}, function (err, numOfDocs) {
                if (err) {
                    return err;
                } else {
                    console.log(numOfDocs, "numofDocs");
                    totalData = numOfDocs;
                }
            });
            // console.log(totalData);
            userData.deleteMany({
                eventId: eventId
            }, async function (err, result) {
                if (err) {
                    console.log(err);
                } else if (result) {
                    console.log(result.deletedCount);
                    documentCount = result.deletedCount;
                    console.log(documentCount, "count");
                    console.log(totalData, "totalCount");
                    console.log("sheetLength", sheetData.length);
                    sheetData.forEach(async (a) => {
                        // data.push(a);
                        const data = new userData({
                            name: a.name,
                            email: a.email,
                            regId: Math.floor(a.regId),
                            seatNo: a.seatNo,
                            present: a.present,
                            eventId: eventId
                        });
                        console.log(a.name);
                        data.save((err) => {
                            if (err) {
                                console.log(err.message);
                                sheetCount++;
                            } else {
                                sheetCount++;
                                // console.log(count);
                                console.log("sheetCount", sheetCount);
                                if (sheetCount == sheetData.length) {
                                    console.log("uploaded Successfully");
                                    deleteFile(fileName);
                                    res.status(200).send({
                                        message: "Uploaded Successfully"
                                    });
                                }
                            }
                        });
                    });
                }
            });
            // console.log(sheetData.length);
        }
        // This below code is to delete All the files in the upload folder
        function deleteFile(deleteFile) {
            fs.readdir("./uploads", (err, files) => {
                if (err) throw err;
                for (const file of files) {
                    console.log("delete file===>", file);
                    console.log("delete file2===>", deleteFile);
                    if (file === deleteFile) {
                        fs.unlinkSync(`./uploads/${file}`, (err) => {
                            if (err) throw err;
                        });
                        break;
                    }
                }
            });
        }
    } catch (error) {
        console.log("err", error);
        res.status(500).send({
            message: err.message
        });
    }
};

module.exports = {
    getAllUserDetails,
    getuserDetails,
    markpresence,
    singleUserData,
    totalAbsent,
    uploadSheet,
}