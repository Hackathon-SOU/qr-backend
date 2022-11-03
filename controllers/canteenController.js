const canteenData = require("../models/canteen");
const userData = require("../models/user");
const volunteerData = require("../models/member");
const foodItems = require("../models/foodItem");
const mongoose= require("mongoose");


const createCanteen = async (req, res, next) => {
    try{
    const canteenName = req.query.canteenName;
    const ownerName = req.query.ownerName;
    const phoneNo = req.query.phoneNo;
        const data = await canteenData.create({
            canteenName: canteenName,
            ownerName: ownerName,
            phoneNo: phoneNo
        });
        console.log("data===>", data);
        if (data) {
            res.send("Hurray, your Canteen added in the SOU")
        }
    }catch(error){
        console.log("catch error==>", error);
        error.code==11000? 
         Object.keys(error.keyPattern)== "canteenName"? res.send(`You have entered Duplicated Canteen Name`):
          Object.keys(error.keyPattern)== "phoneNo"&& res.send(`You have entered Duplicated No`):
           error.errors.phoneNo? res.send(error.errors.phoneNo.message):
          res.send(error);
    }
}

const createFoodItem = async (req, res, next) => {
    try{
    const name = req.query.name;
    const price = req.query.price;
    const canteenId = req.query.canteenId;

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
    }catch(error){
        console.log("catch error==>", error);
        res.send(error);
    }
}

const getMenu = async (req, res, next) => {
    try{
    const canteenId = req.query.canteenId;
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