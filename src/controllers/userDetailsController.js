const userData = require("../models/user");
const eventData = require("../models/event");
const render = require("xlsx");
const httpStatus = require("http-status");
const fs = require("fs");
const path = require("path");

const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

const getuserDetails = async (req, res, next) => {
    try {
        res.append('Access-Control-Allow-Headers', 'Content-Type');
        const regId = req.query.regId;
        logger.info("regID===> %s", regId);
        let resultUser = await userData.findOne({
            regId: regId
        }, {
            _id: 0,
            __v: 0
        });
        if (Boolean(resultUser)) {
            if (resultUser.present === true) {
                throw new ApiError(httpStatus.FORBIDDEN, "The person is already marked present. Please check your Registration Id.");
            } else {
                logger.info("The particpant value fetched successfully");
                return res.status(200).send(resultUser);
            }
        } else {
            throw new ApiError(httpStatus.NOT_FOUND, 'Oops, No participant found with this regId');
        }

    } catch (error) {
        logger.error("Get user details catch error====> %o", error);
        next(error);
    }
};

const getAllUserDetails = async (req, res, next) => {
    try {
        const eventId = req.body.eventId;
        const volunteerId = req.volunteerId;
        const eventFound = await eventData.findOne({
            id: eventId
        });
        if (Boolean(eventFound)) {
            const resultUsers = await userData.find({
                eventId: eventId
            }, {
                _id: 0,
                __v: 0
            });
            if (Boolean(resultUsers)) {
                if (resultUsers.length == 0) {
                    logger.info("No participant found with this event Id");
                    throw new ApiError(httpStatus.NOT_FOUND, 'No participant found. Please add participant in your event');
                } else {
                    logger.info("Users fetched Succesfully");
                    return res.status(200).send(resultUsers);
                }
            }
        } else {
            logger.info("No participant found with event Id");
            throw new ApiError(httpStatus.NOT_FOUND, 'No event is found with this eventId');
        }
    } catch (error) {
        logger.error("Get all participant catch error==> %o", error);
        next(error);
    }

};

const markpresence = async (req, res, next) => {
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
        logger.debug("response===>", response);
        if (response.matchedCount == 0) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Participant not found');
        } else {
            if (response.modifiedCount == 1) {
                if (response.acknowledged === true) {
                    res.status(200).send({
                        message: "Marked as Present"
                    });
                    logger.info("In Mark presence, Participant is marked present Succesfully")
                }
            } else {
                throw new ApiError(httpStatus.FORBIDDEN, 'Participant already present');
            }
        }
    } catch (error) {
        logger.error("mark presence catch error ===>",
            error);
        next(error);
    }
};

const singleUserData = async (req, res, next) => {
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
                error = new ApiError(httpStatus.CONFLICT, 'You have already registered with this email');
            } else if (Object.keys(error.keyPattern) == "regId") {
                error = new ApiError(httpStatus.CONFLICT, 'You have already registered with this regId');
            } else if (Object.keys(error.keyPattern) == "seatNo") {
                error = new ApiError(httpStatus.CONFLICT, 'Oops this seat already reserved. Please Check your SeatNo');
            }
        }
        next(error);
    }
};

const totalAbsent = async (req, res, next) => {
    try {
        userData.count({
            present: false
        }, function (err, numofDocs) {
            if (err) {
                err = new ApiError(httpStatus.BAD_REQUEST, err.message);
            }
            res.status(200).send({
                count: numofDocs
            });
        });
    } catch (err) {
        logger.error("total absent count catch error ====> %o", err);
        next(err);
    }
};

const uploadSheet = async (req, res, next) => {
    try {
        // Below code is to upload Sheet from    
        const eventId = req.query.eventId;
        logger.info("eventId===> %s", eventId);
        let fileName = req.fileName;
        logger.info("req.fileName===> %s", req.fileName);
        let filePath = path.join(path.resolve(), `./tmp/${fileName}`);
        logger.debug("path of upload sheet===>%o", filePath);
        var file = render.readFile(filePath);
        // logger.info("file========>%o", file);
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
            fs.readdir("./tmp", (err, files) => {
                if (err) throw err;
                for (const file of files) {
                    logger.info("file in folders===>%s", file);
                    if (file === deleteFile) {
                        logger.info("file deleted===>%s", deleteFile);
                        fs.unlinkSync(`./tmp/${file}`, (err) => {
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
            errorMessage: error.message
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