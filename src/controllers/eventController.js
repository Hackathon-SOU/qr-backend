const mongoose = require("mongoose");
const httpStatus = require('http-status');
const xlsx = require('xlsx');
const tmp = require('tmp');
const path = require('path');
const ApiError = require('../utils/ApiError');
const eventData = require("../models/event");
const userData = require("../models/user");
const logger = require("../utils/logger");

const createEvent = async (req, res, next) => {
    try {
        const {
            eventType,
            eventDate,
            eventName
        } = req.body;
        const data = await eventData.create({
            eventName,
            eventDate,
            eventType,
        });
        if (Boolean(data)) {
            res.status(200).send({
                message: "Event Created Successfully",
                data: data
            });
            logger.info("Event created Successfully", );
        }
    } catch (error) {
        logger.error("Event,  register catch error===> %o", error);
        if (error.code == 11000) {
            if (Object.keys(error.keyPattern) == "eventDate") {
                logger.error("Event,  Duplicate Event found");
                error = new ApiError(httpStatus.CONFLICT, 'You have entered Duplicated Event');
            }
        }
        next(error);
    }
}
const getEvent = async (req, res, next) => {
    try {
        const data = await eventData.find({}, {
            __v: 0
        });
        if (data) {
            res.status(200).send(data);
            logger.info("Get Event List fetched successfully");
        }
    } catch (error) {
        logger.error("Get event catch error==> %o", error);
        next(error);
    }
}

const getEventReport = async (req, res, next) => {
    try {
        console.log(req.query.eventId);
        const eventId = req.query.eventId;
        const data = await userData.find({
            eventId: eventId,
        }, {
            _id: 0,
            __v: 0,
            eventId: 0,
        });
        let dataString = JSON.stringify(data);
        let dataJson = JSON.parse(dataString);
        console.log("data fetched===> %o", dataJson);
        const ws = xlsx.utils.json_to_sheet(dataJson, {
            header: ["name", "regId", "email", "present", "points"]
        });
        logger.info("worksheet created");
        const wb = xlsx.utils.book_new()
        logger.info("workbook created");
        xlsx.utils.book_append_sheet(wb, ws, 'Report', true)
        logger.info("worksheet appended in workbook");
        tmp.file({
            mode: 0o644,
            prefix: 'prefix-',
            postfix: '.xlsx'
        }, function _tempFileCreated(err, filePath, fd, cleanupCallback) {
            if (err) throw err;

            console.log('File: ', filePath);
            console.log('Filedescriptor: ', fd);

            xlsx.writeFile(wb, `${filePath}`)
            logger.info("writing file");
            res.status(200).download(`${filePath}`);
            cleanupCallback();
        });
    } catch (error) {
        logger.error("get event report catch error ==> %o", error);
        next(error);
    }
}

const deleteEvent = async (req, res, next) => {
    let session = await mongoose.startSession();
    try {
        session.startTransaction({
            readConcern: {
                level: "snapshot"
            },
            writeConcern: {
                w: "majority"
            }
        });

        const opts = {
            upsert: true,
            new: true,
            session: session
        };
        const eventId = req.body.eventId;
        logger.debug("eventId %s", eventId);
        const userResult = await userData.deleteMany({
            eventId: eventId
        });
        logger.debug("userResult ====> %o", userResult);
        if (userResult.acknowledged === true) {
            const eventResult = await eventData.deleteOne({
                _id: Object(eventId)
            });
            logger.debug("eventResult ==> %o", eventResult);
            if (eventResult.acknowledged === true && eventResult.deletedCount === 1) {
                res.status(httpStatus.OK).send({
                    message: "Event Deleted Successfully"
                });
                await session.commitTransaction();
                session.endSession();
            } else {
                next(new ApiError(httpStatus.CONFLICT, "This Event is not in the database"));
            }
        }

    } catch (error) {
        logger.error("delete event catch error =>", error);
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}
module.exports = {
    createEvent,
    getEvent,
    getEventReport,
    deleteEvent
}