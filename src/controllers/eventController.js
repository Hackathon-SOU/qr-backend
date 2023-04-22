const mongoose = require("mongoose");
const httpStatus = require("http-status");
const xlsx = require("xlsx");
const tmp = require("tmp");
const path = require("path");
const ApiError = require("../utils/ApiError");
const eventData = require("../models/event");
const eventRegistration = require("../models/eventRegistration");
const userData = require("../models/user");
const logger = require("../utils/logger");

const createEvent = async (req, res, next) => {
  try {
    const { eventType, eventDate, eventName } = req.body;
    const data = await eventData.create({
      eventName,
      eventDate,
      eventType,
    });
    if (Boolean(data)) {
      res.status(200).send({
        message: "Event Created Successfully",
        data: data,
      });
      logger.info("Event created Successfully");
    }
  } catch (error) {
    logger.error("Event,  register catch error===> %o", error);
    if (error.code == 11000) {
      if (Object.keys(error.keyPattern) == "eventDate") {
        logger.error("Event,  Duplicate Event found");
        error = new ApiError(
          httpStatus.CONFLICT,
          "You have entered Duplicated Event"
        );
      }
    }
    next(error);
  }
};
const getEvent = async (req, res, next) => {
  try {
    const data = await eventData.find(
      {},
      {
        __v: 0,
      }
    );
    if (data) {
      res.status(200).send(data);
      logger.info("Get Event List fetched successfully");
    }
  } catch (error) {
    logger.error("Get event catch error==> %o", error);
    next(error);
  }
};

const getEventReport = async (req, res, next) => {
  try {
    console.log(req.query.eventId);
    const eventId = req.query.eventId;
    let data = await eventRegistration
      .find(
        {
          eventId: eventId,
        },
        {
          _id: 0,
          __v: 0,
          eventId: 0,
        }
      )
      .populate("userId", {
        _id: 0,
        name: 1,
        email: 1,
        membershipId: 1,
        college: 1,
        branch: 1,
        sem: 1,
      });

    const count = await eventRegistration
      .find({ eventId: eventId, present: true })
      .count();
    logger.debug("participant present ---- %s", count);
    data = data.map((user, index) => {
      if (index === 0) {
        user.userId.totalPresent = count;
        user.userId.totalAbsent = data.length - count;
        console.log(user.userId.totalAbsent, user.userId.totalPresent);
      }
      return {
        RegId: user.regId,
        Present: user.present,
        Name: user.userId.name,
        Email: user.userId.email,
        MembershipId: user.userId.membershipId,
        Branch: user.userId.branch,
        Sem: user.userId.sem,
        "Total-Present": user.userId.totalPresent,
        "Total-Absent": user.userId.totalAbsent,
      };
    });
    let dataString = JSON.stringify(data);
    let dataJson = JSON.parse(dataString);
    console.log("data fetched===> %o", dataJson);
    const ws = xlsx.utils.json_to_sheet(dataJson, {
      header: [
        "Name",
        "RegId",
        "Email",
        "MembershipId",
        "College",
        "Branch",
        "Sem",
        "Present",
        "Total-Present",
        "Total-Absent",
      ],
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
  } catch (error) {
    logger.error("get event report catch error ==> %o", error);
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  let session = await mongoose.startSession();
  try {
    session.startTransaction({
      readConcern: {
        level: "snapshot",
      },
      writeConcern: {
        w: "majority",
      },
    });

    const opts = {
      upsert: true,
      new: true,
      session: session,
    };
    const eventId = req.body.eventId;
    logger.debug("eventId %s", eventId);
    const eventRegistrationResult = await eventRegistration.deleteMany({
      eventId: eventId,
    });
    logger.debug("eventRegistrationResult ====> %o", eventRegistrationResult);
    if (eventRegistrationResult.acknowledged === true) {
      const eventResult = await eventData.deleteOne({
        _id: Object(eventId),
      });
      logger.debug("eventResult ==> %o", eventResult);
      if (eventResult.acknowledged === true && eventResult.deletedCount === 1) {
        res.status(httpStatus.OK).send({
          message: "Event Deleted Successfully",
        });
        await session.commitTransaction();
        session.endSession();
      } else {
        next(
          new ApiError(httpStatus.CONFLICT, "This Event is not in the database")
        );
      }
    }
  } catch (error) {
    logger.error("delete event catch error =>", error);
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
module.exports = {
  createEvent,
  getEvent,
  getEventReport,
  deleteEvent,
};
