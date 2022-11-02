const eventData = require("../models/event");
const volunteerData = require("../models/member");

const createEvent = async (req, res, next) => {
    try {
        const eventName = req.query.eventName;
        const eventDate = req.query.eventDate;
        const eventType = req.query.eventType;
        const volunteerId = req.volunteerId;

        console.log(volunteerId);
        let admin = volunteerData.findById({
            _id: volunteerId,
        });

        if (admin) {
            admin.then((user) => {
                console.log(user);
                // console.log(eventName, eventType, eventDate);
                const data= new eventData({
                    eventName: eventName,
                    eventDate: eventDate,
                    eventType: eventType,
                });
                data.save().then((data)=>{
                    if(data){
                        res.status(200).send("Event Created Successfully");
                    }
                }).catch((error) => {
                    res.send(error.message);
                });
            });
        } else {
            res.status(500).send("Oops, it seems you are not part of IEEE.");
        }
    } catch (error) {
        console.log("errrr===>", error);
    }
}

module.exports = {
    createEvent
}