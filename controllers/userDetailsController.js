const userData = require("../models/user");
const eventData = require("../models/event");
const render = require("xlsx");
// const mongoose = require("mongoose");
const fs = require("fs");
const logger = require("../utils/logger");

const getuserDetails = async (req, res, next) => {
    try {
        const regId = req.body.regId;
        logger.info("regID===> %s", regId);
        let resultUser = await userData.findOne({
            regId: regId
        }, {
            _id: 0,
            __v: 0
        });
        if (Boolean(resultUser)) {
            if (resultUser.present === true) {
                logger.info("The participant is already mark present");
                return res
                    .status(403)
                    .send({
                        message: "The person is already marked present. Please check your Registration Id."
                    });
            } else {
                logger.info("The particpant value fetched successfully");
                return res.status(200).send(resultUser);
            }
        } else {
            logger.info("No participant found with this regId");
            res.status(404).send({
                message: "Oops, No participant found with this regId"
            });
        }

    } catch (error) {
        logger.error("Get user details catch error====> %o", error);
        res
            .status(500)
            .send({
                message: "Can not fetch user at the moment. Please try again later.",
                errorMessage: error.message
            });
    }
};

const getAllUserDetails = async (req, res, next) => {
    try {
        const eventId = req.body.eventId;
        const volunteerId = req.volunteerId;
        const eventFound = await eventData.findOne({
            id: eventId
        });
        logger.debug("%s", eventFound);
        if (Boolean(eventFound)) {
            const resultUsers = await userData.find({
                eventId: eventId
            }, {
                _id: 0,
                __v: 0
            });
            logger.info("%s", resultUsers);
            if (Boolean(resultUsers)) {
                if (resultUsers.length == 0) {
                    logger.info("No participant found with this event Id");
                    return res.status(404).send({
                        message: "No participant found. Please add participant in your event",
                    })
                } else {
                    logger.info("Users fetched Succesfully");
                    return res.status(200).send(resultUsers);
                }
            }
        } else {
            logger.info("No participant found with event Id");
            return res.status(404).send({
                message: "No event is found with this eventId",
                errorMessage: error.message
            });
        }
    } catch (error) {
        logger.error("Get all participant catch error==> %o", error);
        res.status(500).send({
            message: "Oops we can not fetch data at the moment. Please try again later",
            errorMessage: error.message
        })
    }

};

const markpresence = async (req, res) => {
    try {
        const regId = req.body.regId;
        const present = req.body.present;
        const response = await userData.updateOne({
            regId: regId
        }, {
            $set: {
                present: present,
            },
        });
        if (response.matchedCount == 1) {
            res.status(404).send({
                message: "Participant not found"
            });
            logger.error("In Mark presence, Participant not found");
        }
        if (response.modifiedCount == 1) {
            if (response.acknowledged === true) {
                res.status(200).send({
                    message: "Marked as Present"
                });
                logger.info("In Mark presence, Participant is marked present Succesfully")
            }
        } else {
            res.status(403).send({
                message: "Participant already present"
            });
            logger.error("In Mark presence, Participant is already marked present.")
        }
    } catch (error) {
        logger.error("mark presence catch error ===>",
            error);
        res.status(500).send({
            message: "You have made a BAD request",
            errorMessage: error.message
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
            name,
            email,
            regId,
            seatNo,
            present,
            eventId,
        });

        if (Boolean(data)) {
            res.status(200).send({
                message: "User Added Successfully"
            });
            logger.info("Participant account created Successfully");
        }
    } catch (error) {
        if (error.code == 11000) {
            if (Object.keys(error.keyPattern) == "email") {
                res.status(409).send({
                    message: "You have already registered with this email"
                })
                logger.error("Participant,  Duplicate Email found")
            } else if (Object.keys(error.keyPattern) == "regId") {
                res.status(409).send({
                    message: "You have already registered with this regId"
                });
                logger.error("Participant,  Duplicate Reg. Id found");
            } else if (Object.keys(error.keyPattern) == "seatNo") {
                res.status(409).send({
                    message: "Oops this seat already reserved. Please Check your SeatNo"
                });
                logger.error("Participant,  This %s Seat Number is reserved ");
            } else {
                res.status(500).send({
                    message: "You have a BAD request",
                    errorMessage: error.message
                });
                logger.error("Participant,  register catch error===> %o", error);
            }
        }
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
                logger.error("count total absent error==> %o", err);
            }
            logger.info("%d", numofDocs);
            res.status(200).send({
                count: numofDocs
            });
        });
    } catch (err) {
        logger.error("total absent count catch error ====> %o", err);
        res.status(500).send({
            message: "You have made a BAD request",
            errorMessage: err.message
        })
    }
};

const uploadSheet = async (req, res, next) => {
    try {
        // Below code is to upload Sheet from    
        const eventId = req.query.eventId;
        let fileName = req.fileName;
        var file = render.readFile(`./uploads/${fileName}`);
        const sheet = file.SheetNames;
        for (var i = 0; i < sheet.length; i++) {
            var sheetName = sheet[i];
            const sheetData = render.utils.sheet_to_json(file.Sheets[sheetName]);
            let documentCount;
            let totalData;
            let sheetCount = 0;
            totalData = await userData.count({});
            logger.info("Total numOfparticpant user in db ====> %s", totalData);
            userData.deleteMany({
                eventId: eventId
            }, async function (err, result) {
                if (err) {
                    logger.error("uploadSheet, user data delete many error===> %o", err);
                } else if (result) {
                    logger.info("%s - deleted docs of the event", result.deletedCount);
                    documentCount = result.deletedCount;
                    logger.info("%s totalCount", totalData);
                    logger.info("sheetLength ===> %s", sheetData.length);
                    let errorArray = [];
                    sheetData.forEach(async (a) => {
                        const data = new userData({
                            name: a.name,
                            email: a.email,
                            regId: Math.floor(a.regId),
                            seatNo: a.seatNo,
                            present: a.present,
                            eventId: eventId
                        });
                        data.save(async (error) => {
                            if (error) {
                                if (error.code == 11000) {
                                    if (error.keyPattern.regId) {
                                        errorArray.push({
                                            error: `Duplicate ${a.regId} regId for participant ${a.name} in sheet`,
                                        });
                                        logger.error("uploadSheet, Duplicate regId in sheet, ==> %o", error);
                                    } else if (error.keyPattern.email) {
                                        errorArray.push({
                                            error: `Duplicate ${a.email} email for participant ${a.name} in sheet`,
                                        });
                                        logger.error("uploadSheet, Duplicate email in sheet==> %o", error);
                                    } else if (error.keyPattern.seatNo) {
                                        errorArray.push({
                                            error: `Seat no ${a.seatNo} can not allocate to particpant ${a.name} in sheet`,
                                        });
                                        logger.error("uploadSheet, Duplication seatNo in sheet==> %o", error);

                                    }
                                }
                                sheetCount++;
                            } else {
                                await logger.info("%s added", a.name);
                                sheetCount++;
                                // logger.info(count);
                                await logger.info("sheetCount %s", sheetCount);
                            }
                            if (sheetCount == sheetData.length) {
                                logger.info("ulpoadSheet, uploaded Successfully");
                                deleteFile(fileName);
                                res.status(200).send({
                                    message: "Sheet Uploaded Successfully, and Participants added in the Event",
                                    error: errorArray
                                });
                            }
                        })
                    });
                }
            });
        };
        // This below code is to delete All the files in the upload folder
        function deleteFile(deleteFile) {
            fs.readdir("./uploads", (err, files) => {
                if (err) throw err;
                for (const file of files) {
                    logger.info("file in folders===>%s", file);
                    if (file === deleteFile) {
                        logger.info("file deleted===>%s", deleteFile);
                        fs.unlinkSync(`./uploads/${file}`, (err) => {
                            if (err) throw err;
                        });
                        break;
                    }
                }
            });
        }
    } catch (error) {
        logger.error("upload sheet catch err===> %o", error);
        res.status(500).send({
            messaage: "You have made a BAD request",
            errorMessage: err.message
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