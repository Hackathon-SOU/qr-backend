const mongoose = require("mongoose");
const httpStatus = require("http-status");

const ApiError = require("../utils/ApiError");
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
            res.status(200).send({
                message: "Hurray, your food Item added in your Menu"
            });
            logger.info("Food Item Created Successfully");
        }
    } catch (error) {
        logger.error("Create Food item, catch error==> %o", error);
        next(error);
    }
}

const getMenu = async (req, res, next) => {
    try {
        const canteenId = req.body.canteenId || req.canteenId;
        const data = await foodItems.find({
            canteenId: canteenId,
        }, {
            _id: 0,
            __v: 0
        });
        if (data) {
            logger.debug("data menu food===>%o", data);
            res.status(200).send(data);
            logger.info("Menu of the canteen Fetched Successfully");
        }
    } catch (error) {
        logger.error("get Menu catch error==> %o", error);
        next(error);
    }
}

const getCanteen = async (req, res, next) => {
    try {
        const data = await canteenData.find({}, {
            canteenName: 1,
            ownerName: 1,
        });
        if (data) {
            res.status(200).send(data);
            logger.info("Canteen List fetched Succesfully");
        }
    } catch (error) {
        logger.error("Get Canteen List, catch error==> %o", error);
        next(error);
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
        for (const value of foodItemArray) {
            await foodItems.findById(value.foodItemId, null, opts).then(async (item) => {
                calcPrice += await item.price * value.quantity;
                logger.debug("calcPrice=====>%s", calcPrice);
            });
        };
        logger.debug("Calculated Total Price of the order Succesfully %s", calcPrice);
        let userPoints = await userData.findOne({
            _id: userId
        });
        logger.debug("userPoints==> %s, calcPrice===> %s", userPoints.points, calcPrice);
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
                res.status(200).send({
                    message: "Hurray!!!!, your order has been placed. It will take some time. Enjoy your meal",
                    transaction: transactionRef
                });
                logger.debug("session state==>%s", session.transaction.state);
                await session.commitTransaction();
                session.endSession();
                logger.info("Transaction of the order completed Succesfully");
            }
        } else {
            logger.error("User do not have enough points");
            logger.debug("session state==>%s", session.transaction.state);
            throw new ApiError(httpStatus.FORBIDDEN, "Oops...., it seems You don't have enough points.");
        }
    } catch (error) {
        logger.error("transaction order catch error===> %o", error);
        logger.debug("session state==>%s", session.transaction.state);
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

const getAllTransaction = async (req, res, next) => {
    try {
        const {
            userId,
            canteenId
        } = req;
        let transactions;
        if (userId) {
            transactions = await transactionData.find({
                userId: userId
            }, {
                userId: 0,
                canteenId: 0,
                __v: 0
            }).populate("canteenId", {
                canteenName: 1
            });
        } else {
            transactions = await transactionData.find({
                canteenId: canteenId
            }, {
                canteenName: 0,
                userId: 0,
                __v: 0
            }).populate("userId", {
                name: 1
            });
        }
        if (Boolean(transactions)) {
            res.status(200).send(transactions);
            logger.info("Transactions fetched succesfully");
        }
    } catch (error) {
        logger.error("get all transaction catch error ===> %o", error);
        next(error);
    }
}

module.exports = {
    createFoodItem,
    getMenu,
    getCanteen,
    orderFood,
    getAllTransaction
}