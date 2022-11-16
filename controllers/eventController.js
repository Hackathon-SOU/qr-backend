const eventData = require("../models/event");

const createEvent = async (req, res, next) => {
    try {
        const eventName = req.body.eventName;
        const eventDate = req.body.eventDate;
        const eventType = req.body.eventType;
        // console.log(eventName, eventType, eventDate);
        const data = await eventData.create({
            eventName: eventName,
            eventDate: eventDate,
            eventType: eventType,
        });
        if (data) {
            res.status(200).send("Event Created Successfully");
        }
    } catch (error) {
        console.log("errrr===>", error);
        error.code == 11000 ?
            Object.keys(error.keyPattern) == "eventDate" && res.send("You have entered Duplicated Event") :
            error.errors.eventDate ? res.send(error.errors.eventDate.message) :
            res.send(error);
    }
}

const getEvent = async (req, res, next) => {
    try {
        const data = await eventData.find({}, {
            __v: 0
        });
        if (data) {
            console.log("data==>", data);
            res.send(data);
        } else {
            res.status(401).send("Something is wrong");
        }
    } catch (error) {
        console.log("catch error==>", error);
        res.send(error);
    }
}
module.exports = {
    createEvent,
    getEvent
}