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
            res.sendStatus(200).send({
                message: "Event Created Successfully",
                data: data
            });
            logger.info("Event created Successfully", );
        }
    } catch (error) {
        if (error.code == 11000) {
            if (Object.keys(error.keyPattern) == "eventDate") {
                res.sendStatus(409).send({
                    message: "You have entered Duplicated Event"
                })
                logger.error("Event,  Duplicate Event found");
            } else {
                logger.error("Event,  register catch error===> ", error);
                res.sendStatus(500).send({
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
            res.sendStatus(200).send(data);
            logger.info("Get Event List fetched successfully");
        } else {
            res.sendStatus(401).send("Something is wrong");
        }
    } catch (error) {
        logger.error("Get event catch error==>", error);
        res.sendStatus(500).send({
            message: error.message
        });
    }
}
module.exports = {
    createEvent,
    getEvent
}