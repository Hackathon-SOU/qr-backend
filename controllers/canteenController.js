const canteenData = require("../models/canteen");
const userData = require("../models/user");
const foodItems = require("../models/foodItem");
const mongoose= require("mongoose");


const createFoodItem = async (req, res, next) => {
    try{
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
    }catch(error){
        console.log("catch error==>", error);
        res.send(error);
    }
}

const getMenu = async (req, res, next) => {
    try{
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
    }catch(error){
        console.log("catch error==>", error);
        res.send(error);
    }
}

const getCanteen = async (req, res, next) => {
    try{
        const data = await canteenData.find({}, {
            __v: 0
        });
        if (data) {
            console.log("data==>", data);
            res.send(data);
        } else {
            res.status(401).send("Something is wrong");
        }
    }catch(error){
        console.log("catch error==>", error);
        res.send(error);
    }
}

const orderFood = async (req, res, next) => {
    setTimeout(async ()=>{
        let session = await mongoose.startSession();
    try {
            session.startTransaction();
    
            const opts = {
                session
            };
            const userId = req.body.userId;
            const canteenId = req.body.canteenId;
            const foodItemId = req.body.foodItemId;
            const quantity = parseInt(req.body.quantity);
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
    } catch (error) {
        console.log(error);
        session.endSession();
    }
    }, 3000)
}

module.exports = {
    createFoodItem,
    getMenu,
    getCanteen,
    orderFood
}