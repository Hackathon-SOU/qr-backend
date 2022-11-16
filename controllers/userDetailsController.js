const userData = require("../models/user");
const render = require("xlsx");
const fs = require("fs");

const getuserDetails = async (req, res, next) => {
    try {
        const regId = req.body.regId;
        console.log("regID", regId);
        let resultUser = await userData.findOne({
            regId: regId
        }, {
            _id: 0,
            __v: 0
        });
        console.log(resultUser);
        if (resultUser.present === true) {
            return res
                .status(500)
                .send(
                    "The person is already marked present. Please check your Registration Id."
                );
        } else {
            return res.send(resultUser);
        }

    } catch (error) {
        console.log(error);
        res
            .status(500)
            .send(
                "There is no such Particpant here. Please check your Registration Id"
            );
    }
};

const getAllUserDetails = async (req, res, next) => {
    try {
        const eventId = req.query.eventId;
        const volunteerId = req.volunteerId;

        userData.find({
            eventId: eventId
        }, {
            _id: 0,
            __v: 0
        }).then((data, error) => {
            if (data) {
                res.send(data);
            } else {
                console.log("find user error===>", error);
                res.status(501).send({
                    message: error.message
                });
            }
        })
    } catch (error) {
        console.log("catch error==>", error);
        res.send({
            message: error.message
        })
    }

};

const markpresence = async (req, res) => {
    const regId = req.body.regId;
    const present = req.body.present;
    console.log(regId);
    console.log(present);
    try {
        const response = userData.updateOne({
            regId: regId
        }, {
            $set: {
                present: present,
            },
        });
        // console.log(response);
        response.then((result) => {
            if (result.acknowledged === true) {
                res.send({
                    message: "Marked as Present"
                });
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: error.message
        });
    }
};

const singleUserData = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const regId = req.body.regId;
        const seatNo = req.body.seatNo;
        const present = req.body.present;

        if (!name || !email || !regId) {
            res.status(404).send({
                message: "Something is missing"
            });
        } else {
            const data = await userData.create({
                name: name,
                email: email,
                regId: regId,
                seatNo: seatNo,
                present: present,
            });
            if (data) {
                console.log("data==>", data);
                res.send({
                    message: "User Added Successfully"
                });
            }
        }

    } catch (error) {
        console.log("errr", error);
        error.code == 11000 ?
            Object.keys(error.keyPattern) == "email" ?
            res.send({
                message: "You have already registered with this email"
            }) :
            Object.keys(error.keyPattern) == "regId" ?
            res.send({
                message: "You have already registered with this regId"
            }) :
            Object.keys(error.keyPattern) == "seatNo" &&
            res.send({
                message: "Oops this seat already reserved. Please Check your SeatNo"
            }) :
            res.send(error);
        // }
    }
};

const totalAbsent = async (req, res) => {
    try {
        userData.count({
            present: false
        }, function (err, numofDocs) {
            if (err) {
                res.status(500).send({
                    message: err.message
                });
                console.log(err);
            }
            console.log(numofDocs);
            res.status(200).send({
                count: numofDocs
            });
        });
    } catch (err) {
        console.log({
            message: err.message
        });
    }
};

const uploadSheet = async (req, res, next) => {
    try {
        // const eventId= req.body.eventId;
        // Below code is to upload Sheet from    
        const eventId = req.body.eventId;
        console.log("body===>", req.body)
        console.log("eventId", eventId);
        let fileName = req.fileName;
        console.log("fileName===>", fileName)
        var file = render.readFile(`./uploads/${fileName}`);
        const sheet = file.SheetNames;
        // console.log(sheet);
        // var data = [];
        for (var i = 0; i < sheet.length; i++) {
            var sheetName = sheet[i];
            const sheetData = render.utils.sheet_to_json(file.Sheets[sheetName]);
            // console.log(sheetData);
            var documentCount;
            var totalData;
            var sheetCount = 0;
            userData.count({}, function (err, numOfDocs) {
                if (err) {
                    return err;
                } else {
                    console.log(numOfDocs, "numofDocs");
                    totalData = numOfDocs;
                }
            });
            // console.log(totalData);
            userData.deleteMany({
                eventId: eventId
            }, async function (err, result) {
                if (err) {
                    console.log(err);
                } else if (result) {
                    console.log(result.deletedCount);
                    documentCount = result.deletedCount;
                    console.log(documentCount, "count");
                    console.log(totalData, "totalCount");
                    console.log("sheetLength", sheetData.length);
                    sheetData.forEach(async (a) => {
                        // data.push(a);
                        const data = new userData({
                            name: a.name,
                            email: a.email,
                            regId: Math.floor(a.regId),
                            seatNo: a.seatNo,
                            present: a.present,
                            eventId: eventId
                        });
                        console.log(a.name);
                        data.save((err) => {
                            if (err) {
                                console.log(err.message);
                                sheetCount++;
                                // res.status(500).send(err.message);
                            } else {
                                sheetCount++;
                                // console.log(count);
                                console.log("sheetCount", sheetCount);
                                if (sheetCount == sheetData.length) {
                                    console.log("uploaded Successfully");
                                    deleteFile(fileName);
                                    res.status(200).send({
                                        message: "Uploaded Successfully"
                                    });
                                }
                            }
                        });
                    });
                }
            });
            // console.log(sheetData.length);
        }
        // This below code is to delete All the files in the upload folder
        function deleteFile(deleteFile) {
            fs.readdir("./uploads", (err, files) => {
                if (err) throw err;
                for (const file of files) {
                    console.log("delete file===>", file);
                    console.log("delete file2===>", deleteFile);
                    if (file === deleteFile) {
                        fs.unlinkSync(`./uploads/${file}`, (err) => {
                            if (err) throw err;
                        });
                        break;
                    }
                }
            });
        }
    } catch (error) {
        console.log("err", error);
        res.send({
            message: err.message
        });
    }
};

module.exports = {
    getAllUserDetails,
    getuserDetails,
    markpresence,
    singleUserData,
    totalAbsent,
    uploadSheet,
}