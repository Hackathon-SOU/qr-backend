const userData = require("../models/user");
const eventData = require("../models/event");
const eventRegistration = require("../models/eventRegistration");
const xlsx = require("xlsx");
const tmp = require("tmp");

const httpStatus = require("http-status");
const fs = require("fs");
const path = require("path");

const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

const getAllparticipantsList = async (req, res, next) => {
  try {
    const data = await userData.find({}, { _id: 0, __v: 0, points: 0 });
    res.send({
      data: data,
    });
  } catch (error) {
    logger.error("catch getAllParticipants %o", error);
    next(error);
  }
};

const downloadAllParticipantsList = async (req, res, next) => {
  try {
    const data = await userData.find({}, { _id: 0, __v: 0, points: 0 });
    logger.debug("data", data);
    let dataString = JSON.stringify(data);
    let dataJson = JSON.parse(dataString);
    console.log("data fetched===> %o", dataJson);
    const ws = xlsx.utils.json_to_sheet(dataJson, {
      header: ["name", "email"],
    });
    logger.info("worksheet created");
    const wb = xlsx.utils.book_new();
    logger.info("workbook created");
    xlsx.utils.book_append_sheet(wb, ws, "Report", true);
    logger.info("worksheet appended in workbook");
    tmp.file(
      {
        mode: 0o644,
        prefix: "prefix-",
        postfix: ".xlsx",
      },
      function _tempFileCreated(err, filePath, fd, cleanupCallback) {
        if (err) throw err;

        console.log("File: ", filePath);
        console.log("Filedescriptor: ", fd);

        xlsx.writeFile(wb, `${filePath}`);
        logger.info("writing file");
        res.status(200).download(`${filePath}`);
        cleanupCallback();
      }
    );
    // res.send({
    //   data: data,
    // });
  } catch (error) {
    logger.error("catch downloadAllParticipantsData %o", error);
    next(error);
  }
};

const getuserDetails = async (req, res, next) => {
  try {
    res.append("Access-Control-Allow-Headers", "Content-Type");
    const regId = req.query.regId;
    logger.info("regID===> %s", regId);
    let resultUser = await eventRegistration
      .findOne(
        {
          regId: regId,
        },
        {
          _id: 0,
          __v: 0,
          eventId: 0,
        }
      )
      .populate("userId", { name: 1, email: 1, _id: 0 })
      .then((user) => {
        return {
          regId: user.regId,
          present: user.present,
          name: user.userId.name,
          email: user.userId.email,
        };
      });
    console.log("data", resultUser);
    if (Boolean(resultUser)) {
      if (resultUser.present === true) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "The person is already marked present. Please check your Registration Id."
        );
      } else {
        logger.info("The particpant value fetched successfully");
        return res.status(200).send(resultUser);
      }
    } else {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Oops, No participant found with this regId"
      );
    }
  } catch (error) {
    logger.error("Get user details catch error====> %o", error);
    next(error);
  }
};

const getAllUserDetails = async (req, res, next) => {
  try {
    const eventId = req.query.eventId;
    const volunteerId = req.volunteerId;
    const eventFound = await eventData.findOne({
      id: eventId,
    });
    if (Boolean(eventFound)) {
      let resultUsers = await eventRegistration
        .find(
          {
            eventId: eventId,
          },
          {
            _id: 0,
            __v: 0,
          }
        )
        .populate("userId", { name: 1, email: 1, _id: 0 });
      if (Boolean(resultUsers)) {
        if (resultUsers.length == 0) {
          logger.info("No participant found with this event Id");
          throw new ApiError(
            httpStatus.NOT_FOUND,
            "No participant found. Please add participant in your event"
          );
        } else {
          logger.info("Users fetched Succesfully");
          resultUsers = resultUsers.map((user) => {
            return {
              regId: user.regId,
              present: user.present,
              name: user.userId.name,
              email: user.userId.email,
            };
          });
          return res.status(200).send(resultUsers);
        }
      }
    } else {
      logger.info("No participant found with event Id");
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "No event is found with this eventId"
      );
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
    const response = await eventRegistration.updateOne(
      {
        regId: regId,
      },
      {
        $set: {
          present: present,
        },
      }
    );
    logger.debug("response===>", response);
    if (response.matchedCount == 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Participant not found");
    } else {
      if (response.modifiedCount == 1) {
        if (response.acknowledged === true) {
          res.status(200).send({
            message: "Marked as Present",
          });
          logger.info(
            "In Mark presence, Participant is marked present Succesfully"
          );
        }
      } else {
        throw new ApiError(httpStatus.FORBIDDEN, "Participant already present");
      }
    }
  } catch (error) {
    logger.error("mark presence catch error ===>", error);
    next(error);
  }
};

const singleUserData = async (req, res, next) => {
  try {
    const { name, email, regId, seatNo, present, eventId } = req.body;
    const user = await userData.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          name,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
    logger.debug("user %o", user._id);
    const registration = await eventRegistration.create({
      eventId: eventId,
      regId: regId,
      userId: user._id,
      seatNo,
      present,
    });
    console.log("registration", registration);
    res.status(200).send({
      message: "User Added Successfully",
    });
    return logger.info("Participant account created Successfully");
  } catch (error) {
    logger.error(error);
    logger.error("error %o", Object.keys(error.metadata.keyPattern)[1]);
    if (error.metadata.code == 11000) {
      if (Object.keys(error.metadata.keyPattern)[1] == "userId") {
        error = new ApiError(httpStatus.CONFLICT, "Duplicate Email Id found");
      } else if (Object.keys(error.metadata.keyPattern) == "regId") {
        error = new ApiError(
          httpStatus.CONFLICT,
          "You have already registered with this regId"
        );
      } else if (Object.keys(error.metadata.keyPattern)[1] == "seatNo") {
        error = new ApiError(
          httpStatus.CONFLICT,
          "Oops this seat already reserved. Please Check your SeatNo"
        );
      }
    }
    next(error);
  }
};

const totalAbsent = async (req, res, next) => {
  try {
    userData.count(
      {
        present: false,
      },
      function (err, numofDocs) {
        if (err) {
          err = new ApiError(httpStatus.BAD_REQUEST, err.message);
        }
        res.status(200).send({
          count: numofDocs,
        });
      }
    );
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
    let filePath = `${req.dirPath}/${fileName}`;
    // let filePath = `./tmp/${fileName}`;
    logger.debug("path of upload sheet===>%o", filePath);
    var file = xlsx.readFile(filePath);
    // logger.info("file========>%o", file);
    const sheet = file.SheetNames;
    for (var i = 0; i < sheet.length; i++) {
      var sheetName = sheet[i];
      const sheetData = xlsx.utils.sheet_to_json(file.Sheets[sheetName]);
      // let documentCount;
      let totalData;
      // let sheetCount = 0;
      totalData = await userData.count({});
      logger.info("Total numOfparticpant user in db ====> %s", totalData);

      async function deleteEventRegistrationByEventId(eventId) {
        // Delete all the EventRegistration documents
        const deletedEventReg = await eventRegistration.deleteMany({ eventId });
        console.log("deletedEventReg", deletedEventReg);
      }
      await deleteEventRegistrationByEventId(eventId);
      insertParticipantData();
      async function insertParticipantData() {
        logger.info("sheetLength ===> %s", sheetData.length);
        for (const participant of sheetData) {
          try {
            console.log("participant", participant);
            const {
              "[__rowNum__]": rowNum,
              regId,
              email,
              name,
              seatNo,
              present,
            } = participant;
            const user = await userData.findOneAndUpdate(
              { email: email },
              {
                $setOnInsert: {
                  name: name,
                },
              },
              {
                upsert: true,
                new: true,
              }
            );
            console.log("user", user);
            const eventRegisterData = seatNo
              ? {
                  eventId: eventId,
                  regId: regId,
                  userId: user._id,
                  seatNo: seatNo,
                  present: present,
                }
              : {
                  eventId: eventId,
                  regId: regId,
                  userId: user._id,
                  present: present,
                };
            await eventRegistration.create(eventRegisterData);
            logger.debug(`${rowNum} is added successfully`);
          } catch (error) {
            // logger.error(error);
            logger.error("error %o", error);
            logger.error("error detail %o", error.keyPattern);
            if (error.code == 11000) {
              if (Object.keys(error.keyPattern) == "userId") {
                logger.error(
                  "uploadSheet, Duplicate email in sheet==> %o",
                  error
                );
                error = new ApiError(
                  httpStatus.CONFLICT,
                  `Duplicate ${participant.email} email for participant ${participant.name} in sheet`
                );
              } else if (Object.keys(error.keyPattern) == "regId") {
                logger.error(
                  "uploadSheet, Duplicate regId in sheet, ==> %o",
                  error
                );
                error = new ApiError(
                  httpStatus.CONFLICT,
                  `Duplicate ${participant.regId} regId for participant ${participant.name} in sheet`
                );
              } else if (Object.keys(error.keyPattern) == "seatNo") {
                logger.error(
                  "uploadSheet, Duplication seatNo in sheet==> %o",
                  error
                );
                error = new ApiError(
                  httpStatus.CONFLICT,
                  `Seat no ${participant.seatNo} can not allocate to particpant ${participant.name} in sheet`
                );
              }
              next(error);
            } else {
              throw error;
            }
          }
        }
        logger.info("ulpoadSheet, uploaded Successfully");
        deleteFile(fileName);
        res.status(200).send({
          message:
            "Sheet Uploaded Successfully, and Participants added in the Event",
        });
      }
    }
    // This below code is to delete All the files in the upload folder
    function deleteFile(deleteFile) {
      fs.readdir(`${req.dirPath}`, (err, files) => {
        if (err) throw err;
        for (const file of files) {
          logger.info("file in folders===>%s", file);
          if (file === deleteFile) {
            logger.info("file deleted===>%s", deleteFile);
            fs.unlinkSync(`${req.dirPath}/${file}`, (err) => {
              if (err) throw err;
            });
            break;
          }
        }
      });
    }
  } catch (error) {
    console.log("upload error", error);
    logger.error("upload sheet catch err===> %o", error);
    if (error.code == 11000) {
      if (error.keyPattern.regId) {
        logger.error("uploadSheet, Duplicate regId in sheet, ==> %o", error);
        next(
          new ApiError(
            httpStatus.CONFLICT,
            `Duplicate ${a.regId} regId for participant ${a.name} in sheet`
          )
        );
      } else if (error.keyPattern.email) {
        logger.error("uploadSheet, Duplicate email in sheet==> %o", error);
        next(
          new ApiError(
            httpStatus.CONFLICT,
            `Duplicate ${a.email} email for participant ${a.name} in sheet`
          )
        );
      } else if (error.keyPattern.seatNo) {
        logger.error("uploadSheet, Duplication seatNo in sheet==> %o", error);
        next(
          new ApiError(
            httpStatus.CONFLICT,
            `Seat no ${a.seatNo} can not allocate to particpant ${a.name} in sheet`
          )
        );
      }
    } else {
      res.status(500).send({
        messaage: "You have made a BAD request",
        errorMessage: error.message,
      });
    }
  }
};

module.exports = {
  getAllUserDetails,
  getuserDetails,
  markpresence,
  singleUserData,
  totalAbsent,
  uploadSheet,
  getAllparticipantsList,
  downloadAllParticipantsList,
};
