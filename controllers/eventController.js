const eventData = require("../models/event");
const logger = require("../utils/logger");

const createEvent = async (req, res, next) => {
    try {
        const {
            eventType,
            eventDate,
            eventName
        } = req.body;
        // logger.info(eventName, eventType, eventDate);
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
        if (error.code == 11000) {
            if (Object.keys(error.keyPattern) == "eventDate") {
                res.status(409).send({
                    message: "You have entered Duplicated Event"
                })
                logger.error("Event,  Duplicate Event found");
            } else {
                logger.error("Event,  register catch error===> %o", error);
                res.status(500).send({
                    message: error.message
                });
            }
        }
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
        } else {
            res.status(401).send("Something is wrong");
        }
    } catch (error) {
        logger.error("Get event catch error==> %o", error);
        res.status(500).send({
            message: error.message
        });
    }
}
module.exports = {
    createEvent,
    getEvent
}