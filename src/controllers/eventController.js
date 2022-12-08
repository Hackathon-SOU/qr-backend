const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const eventData = require("../models/event");
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
module.exports = {
    createEvent,
    getEvent
}