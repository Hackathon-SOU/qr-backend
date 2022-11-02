const canteenData = require("../models/canteen");
const userData = require("../models/user");
const volunteerData = require("../models/member");
const foodItems = require("../models/foodItem");
const mongoose= require("mongoose");


const createCanteen = async (req, res, next) => {
    const volunteerId = req.volunteerId;
    const canteenName = req.query.canteenName;
    const ownerName = req.query.ownerName;
    let admin = await volunteerData.findOne({
        _id: volunteerId
    }, {
        _id: 0
    });

    if (admin) {
        console.log(admin);
        const data = canteenData.create({
            canteenName: canteenName,
            ownerName: ownerName,
        });
        if (data) {
            res.send("Hurray, your Canteen added in the SOU")
        } else {
            res.send("Something is wrong");
        }
    } else {
        res.send(401).send("Oops, your are not part of IEEE");
    }
}

const createFoodItem = async (req, res, next) => {
    const volunteerId = req.volunteerId;
    const name = req.query.name;
    const price = req.query.price;
    const canteenId = req.query.canteenId;
    let admin = await volunteerData.findOne({
        _id: volunteerId
    }, {
        _id: 0
    });

    if (admin) {
        console.log(admin);
        const data = foodItems.create({
            name: name,
            price: price,
            canteenId: canteenId,
        });
        if (data) {
            res.send("Hurray, your food Item added in your Menu")
        } else {
            res.status(401).send("Something is wrong");
        }
    } else {
        res.send(401).send("Oops, your are not part of IEEE");
    }
}
const getMenu = async (req, res, next) => {
    const volunteerId = req.volunteerId;
    const canteenId = req.query.canteenId;
    let admin = await volunteerData.findOne({
        _id: volunteerId
    }, {
        _id: 0
    });

    if (admin) {
        console.log(admin);
        const data = await foodItems.find({
            canteenId: canteenId,
        }, {
            _id: 0,
            __v: 0
        });
        if (data) {
            console.log("data==>", data);
            res.send(data);
        } else {
            res.status(401).send("Something is wrong");
        }
    } else {
        res.send(401).send("Oops, your are not part of IEEE");
    }
}

const getCanteen = async (req, res, next) => {
    const volunteerId = req.volunteerId;
    let admin = await volunteerData.findOne({
        _id: volunteerId
    }, {
        _id: 0
    });

    if (admin) {
        console.log(admin);
        const data = await canteenData.find({}, {
            __v: 0
        });
        if (data) {
            console.log("data==>", data);
            res.send(data);
        } else {
            res.status(401).send("Something is wrong");
        }
    } else {
        res.send(401).send("Oops, your are not part of IEEE");
    }
}

const orderFood = async (req, res, next) => {
    setTimeout(async ()=>{
        let session = await mongoose.startSession();
    try {
        const volunteerId = req.volunteerId;
        let admin = await volunteerData.findOne({
            _id: volunteerId
        }, {
            _id: 0
        });
    
        if (admin) {
            console.log(admin);
            session.startTransaction();
    
            const opts = {
                session
            };
            const userId = req.query.userId;
            const canteenId = req.query.canteenId;
            const foodItemId = req.query.foodItemId;
            const quantity = parseInt(req.query.quantity);
            let calcPrice;
            await foodItems.findById(foodItemId).then((item) => {
                calcPrice = item.price * quantity;
            });
            let userPoints = await userData.findById(userId).then((user) => {
                console.log(user.points);
                return user.points;
            });
            console.log(calcPrice, userPoints);
            if (userPoints >= calcPrice) {
                await userData.updateOne({
                    id: userId
                }, {
                    $inc: {
                        "points": -calcPrice
                    }
                }).then(() => {
                    console.log("userData document updated");
                });
                await canteenData.updateOne({
                    id: canteenId
                }, {
                    $inc: {
                        "points": +calcPrice
                    }
                }).then((err, response) => {
                    // if(err) throw err;
                    console.log("canteenData document updated");
                });
                res.send("Hurray!!!!, your order has been placed. It will take some time. Enjoy your meal");
            } else {
                res.send("Oops...., it seems You don't have enough points.")
            }
            await session.commitTransaction();
            session.endSession();
        } else {
            res.send(401).send("Oops, your are not part of IEEE");
        }
    } catch (error) {
        console.log(error);
        session.endSession();
    }
    }, 3000)
}

module.exports = {
    createCanteen,
    createFoodItem,
    getMenu,
    getCanteen,
    orderFood
}