const httpStatus = require('http-status');
const xlsx = require('xlsx');
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
        console.log(req.body.eventId);
        const eventId = req.body.eventId;
        const data = await userData.find({
            eventId: eventId,
        }, {
            _id: 0,
            __v: 0,
            eventId: 0,
        });
        let tmp = JSON.stringify(data);
        let dataJson = JSON.parse(tmp);
        console.log("data fetched===> %o", dataJson);
        const ws = xlsx.utils.json_to_sheet(dataJson, {
            header: ["name", "regId", "email", "present", "points"]
        });
        logger.info("worksheet created");
        const wb = xlsx.utils.book_new()
        logger.info("workbook created");
        xlsx.utils.book_append_sheet(wb, ws, 'Report', true)
        logger.info("worksheet appended in workbook");
        xlsx.writeFile(wb, './reports/report.export.xlsx')
        logger.info("writing file");
        res.status(200).sendFile(path.join(path.resolve(), '/reports/report.export.xlsx'))
    } catch (error) {
        logger.error("get event report catch error ==> %o", error);
        next(error);
    }
}
module.exports = {
    createEvent,
    getEvent,
    getEventReport
}