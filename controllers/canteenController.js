const canteenData = require("../models/canteen");
const userData = require("../models/user");
const transactionData = require("../models/transaction");
const foodItems = require("../models/foodItem");
const mongoose = require("mongoose");


const createFoodItem = async (req, res, next) => {
    try {
        const name = req.body.name;
        const price = req.body.price;
        const canteenId = req.canteenId;

        const data = await foodItems.create({
            name: name,
            price: price,
            canteenId: canteenId,
        });
        if (data) {
            res.status(200).send({
                message: "Hurray, your food Item added in your Menu"
            })
        }
    } catch (error) {
        console.log("catch error==>", error);
        res.status(500).send({
            message: error.message
        });
    }
}

const getMenu = async (req, res, next) => {
    try {
        const canteenId = req.canteenId;
        const data = await foodItems.find({
            canteenId: canteenId,
        }, {
            _id: 0,
            __v: 0
        });
        if (data) {
            // console.log("data==>", data);
            res.status(200).send(data);
        }
    } catch (error) {
        console.log("catch error==>", error);
        res.status(500).send({
            message: error.message
        });
    }
}

const getCanteen = async (req, res, next) => {
    try {
        const data = await canteenData.find({}, {
            __v: 0
        });
        if (data) {
            // console.log("data==>", data);
            res.status(200).send(data);
        }
    } catch (error) {
        console.log("catch error==>", error);
        res.status(500).send({
            message: error.message
        });
    }
}

const orderFood = async (req, res, next) => {
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
        const userId = req.userId;
        const canteenId = req.body.canteenId;
        const foodItemArray = req.body.foodItemArray;

        let calcPrice = 0;
        await foodItemArray.forEach(async (value) => {
            await foodItems.findById(value.foodItemId, null, opts).then((item) => {
                calcPrice += item.price * value.quantity;
            });
        });
        let userPoints = await userData.findOne({
            _id: userId
        });
        if (userPoints.points >= calcPrice) {
            const userUpdate = await userData.findOneAndUpdate({
                _id: userPoints._id
            }, {
                $inc: {
                    "points": -calcPrice
                }
            }, opts);

            if (userUpdate.acknowledge == true) {
                console.log({
                    message: "User point Updated"
                });
            }

            const updateCanteen = await canteenData.updateOne({
                _id: canteenId
            }, {
                $inc: {
                    "points": +calcPrice
                }
            }, opts);

            if (updateCanteen.acknowledged == true) {
                console.log({
                    message: "canteenData document updated"
                });
            }
            const transactionRef = await transactionData.create([{
                canteenId: canteenId,
                userId: userId,
                foodItems: foodItemArray,
                price: calcPrice,
            }], opts);
            if (transactionRef) {
                res.status(200).send({
                    message: "Hurray!!!!, your order has been placed. It will take some time. Enjoy your meal",
                    transaction: transactionRef
                });
            }
        } else {
            res.status(403).send({
                message: "Oops...., it seems You don't have enough points."
            });
        }
        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        console.log("error===>", error);
        // console.log(error.message);
        res.status(500).send({
            message: "Oops, Your transaction was not successful, please try Again"
        })
        session.abortTransaction();
        session.endSession();
    }
}

const getAllTransaction = async (req, res, next) => {
    try {
        const userId = req.userId;
        const transactions = await transactionData.find({
            userId: userId
        }, {
            userId: 0,
            __v: 0
        }).populate("canteenId", {
            canteenName: 1
        });
        if (transactions[0].price) {
            res.status(200).send(transactions);
        } else {
            res.status(500).send({
                message: transactions.error.message
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: error.message
        });
    }
}

module.exports = {
    createFoodItem,
    getMenu,
    getCanteen,
    orderFood,
    getAllTransaction
}