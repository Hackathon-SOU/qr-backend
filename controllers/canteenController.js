const canteenData = require("../models/canteen");
const userData = require("../models/user");
const transactionData = require("../models/transaction");
const foodItems = require("../models/foodItem");
const mongoose = require("mongoose");


const createFoodItem = async (req, res, next) => {
    try {
        const name = req.body.name;
        const price = req.body.price;
        const canteenId = req.body.canteenId;

        const data = await foodItems.create({
            name: name,
            price: price,
            canteenId: canteenId,
        });
        if (data) {
            res.send("Hurray, your food Item added in your Menu")
        } else {
            res.status(401).send("Something is wrong");
        }
    } catch (error) {
        console.log("catch error==>", error);
        res.send(error);
    }
}

const getMenu = async (req, res, next) => {
    try {
        const canteenId = req.body.canteenId;
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
    } catch (error) {
        console.log("catch error==>", error);
        res.send(error);
    }
}

const getCanteen = async (req, res, next) => {
    try {
        const data = await canteenData.find({}, {
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

const orderFood = async (req, res, next) => {
    setTimeout(async () => {
        let session = await mongoose.startSession();
        try {
            session.startTransaction();

            const opts = {
                session
            };
            const userId = req.body.userId;
            const canteenId = req.body.canteenId;
            const foodItemArray = req.body.foodItemArray;
            console.log(canteenId, "canteenId");
            let calcPrice = 0;
            await foodItemArray.forEach(async (value) => {
                await foodItems.findById(value.foodItemId).then((item) => {
                    // console.log("item", item)
                    // console.log("item", value.quantity)
                    calcPrice += item.price * value.quantity;
                });
                console.log("calcPrice", calcPrice)
            })
            let userPoints = await userData.findOne({
                _id: userId
            });
            console.log(calcPrice, userPoints);
            if (userPoints.points >= calcPrice) {
                console.log(userPoints);
                await userData.updateOne({
                    _id: userPoints._id
                }, {
                    $inc: {
                        "points": -calcPrice
                    }
                }).then((data) => {
                    console.log("data", data);
                    console.log("userData document updated");
                });

                console.log("it works");
                await canteenData.updateOne({
                    _id: canteenId
                }, {
                    $inc: {
                        "points": +calcPrice
                    }
                }).then((err, response) => {
                    if (err) console.log("errrrr", err);
                    console.log("response", response);
                    console.log("canteenData document updated");
                });
                const transactionRef = await transactionData.create({
                    canteenId: canteenId,
                    userId: userId,
                    foodItems: foodItemArray,
                    price: calcPrice,
                });
                if (transactionRef) {
                    res.send("Hurray!!!!, your order has been placed. It will take some time. Enjoy your meal");
                } else {
                    res.send(transactionRef);
                }
            } else {
                res.send("Oops...., it seems You don't have enough points.")
            }
            await session.commitTransaction();
            session.endSession();
        } catch (error) {
            console.log(error);
            session.endSession();
        }
    }, 3000)
}

const getAllTransaction = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        console.log(userId);
        const transactions = await transactionData.find({
            userId: userId
        }, {
            userId: 0,
            __v: 0
        }).populate("canteenId", {
            canteenName: 1
        });
        console.log("transactions", transactions);
        if (transactions[0].price) {
            res.send(transactions);
        } else {
            res.send(transactions.error);
        }
    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    createFoodItem,
    getMenu,
    getCanteen,
    orderFood,
    getAllTransaction
}