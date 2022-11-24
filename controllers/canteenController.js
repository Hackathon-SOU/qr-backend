const mongoose = require("mongoose");

const canteenData = require("../models/canteen");
const userData = require("../models/user");
const transactionData = require("../models/transaction");
const foodItems = require("../models/foodItem");
const logger = require("../utils/logger");


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
        if (Boolean(data)) {
            res.sendStatus(200).send({
                message: "Hurray, your food Item added in your Menu"
            });
            logger.info("Food Item Created Successfully");
        }
    } catch (error) {
        logger.error("Create Food item, catch error==> %o", error);
        res.sendStatus(500).send({
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
            res.sendStatus(200).send(data);
            logger.info("Menu of the canteen Fetched Successfully");
        }
    } catch (error) {
        logger.error("get Menu catch error==> %o", error);
        res.sendStatus(500).send({
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
            res.sendStatus(200).send(data);
            logger.info("Canteen List fetched Succesfully");
        }
    } catch (error) {
        logger.error("Get Canteen List, catch error==> %o", error);
        res.sendStatus(500).send({
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
        logger.debug("Calculated Total Price of the order Succesfully");
        let userPoints = await userData.findOne({
            _id: userId
        });
        if (userPoints.points >= calcPrice) {
            logger.info("User has points greater than order points");
            const userUpdate = await userData.findOneAndUpdate({
                _id: userPoints._id
            }, {
                $inc: {
                    "points": -calcPrice
                }
            }, opts);

            if (userUpdate.acknowledge == true) {
                logger.debug("User points Updated");
            }

            const updateCanteen = await canteenData.updateOne({
                _id: canteenId
            }, {
                $inc: {
                    "points": +calcPrice
                }
            }, opts);

            if (updateCanteen.acknowledged == true) {
                logger.debug("CanteenData document updated");
            }
            const transactionRef = await transactionData.create([{
                canteenId: canteenId,
                userId: userId,
                foodItems: foodItemArray,
                price: calcPrice,
            }], opts);
            if (transactionRef) {
                res.sendStatus(200).send({
                    message: "Hurray!!!!, your order has been placed. It will take some time. Enjoy your meal",
                    transaction: transactionRef
                });
                logger.info("Transaction of the order completed Succesfully");
            }
        } else {
            res.sendStatus(403).send({
                message: "Oops...., it seems You don't have enough points."
            });
            logger.error("User do not have enough points");
        }
        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        logger.error("transaction order catch error===> %o", error);
        res.sendStatus(500).send({
            message: "Oops, Your transaction was not successful, please try Again"
        });
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
        if (Boolean(transactions)) {
            res.sendStatus(200).send(transactions);
            logger.info("Transactions fetched succesfully");
        } else {
            res.sendStatus(500).send({
                message: transactions.error.message
            });
            logger.info("there is some problem in fetching transaction.")
        }
    } catch (error) {
        logger.error("get all transaction catch error ===> %o", error);
        res.sendStatus(500).send({
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