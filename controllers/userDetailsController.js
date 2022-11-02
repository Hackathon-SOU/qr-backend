const userData = require("../models/user");
const volunteerData = require("../models/member");
const render = require("xlsx");
const multer = require("multer");
const fs = require("fs");

const getuserDetails = async (req, res, next) => {
    try {
        const regId = req.query.regId;
        const volunteerId = req.volunteerId;

        console.log(volunteerId);
        let admin = await volunteerData.findOne({
            _id: volunteerId,
        });

        admin?
                userData.findOne({
                    regId: regId
                }, {_id:0, __v:0}).then((existingUser, err) => {
                    console.log(existingUser);
                    if (existingUser.present === true) {
                        // res.send(existingUser);
                        return res
                            .status(500)
                            .send(
                                "The person is already marked present. Please check your Registration Id."
                            );
                    } else {
                        return res.send(existingUser);
                    }
                })
        : res.status(500).send("Oops, it seems you are not part of IEEE.");

    } catch (error) {
        console.log(error);
        res
            .status(500)
            .send(
                "There is no such Particpant here. Please check your Registration Id"
            );
    }
};

const getAllUserDetails= async(req, res, next) => {
    try {
        const eventId= req.query.eventId;
        const volunteerId = req.volunteerId;

        console.log(volunteerId);
        let admin = await volunteerData.findOne({
            _id: volunteerId,
        });

            console.log("admin==>",admin);
                admin?
                    userData.find({eventId: eventId},{_id:0, __v:0}).then((data, error)=>{
                        if(data){
                        res.send(data);
                        }else{
                        console.log("find user error===>", error);
                        res.status(501).send(error);
                        }
                    })
                    : res.status(500).send("Oops, it seems you are not part of IEEE.");
    } catch (error){
        console.log("catch error==>", error);
    }

};

const markpresence = async (req, res) => {
    const regId = req.body.regId;
    const present = req.body.present;
    console.log(regId);
    console.log(present);
    try {
        const volunteerId = req.volunteerId;

        console.log(volunteerId);
        let admin = volunteerData.findOne({
            _id: volunteerId,
        });

        if (admin) {
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
                        res.send("Marked as Present");
                    }
                })
        } else {
            res.status(500).send("Oops, it seems you are not part of IEEE.");
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

const singleUserData = async (req, res) => {
    try {
        const name = req.query.name;
        const email = req.query.email;
        const regId = req.query.regId;
        const seatNo = req.query.seatNo;
        const present = req.query.present;
        const volunteerId = req.volunteerId;

        console.log(volunteerId);
        let admin = volunteerData.findOne({
            _id: volunteerId,
        });

        if (admin) {
                if (!name || !email || !regId) {
                    res.status(404).send("Something is missing");
                } else {
                    const data = new userData({
                        name: name,
                        email: email,
                        regId: regId,
                        seatNo: seatNo,
                        present: present,
                    });
                    data.save().then((data) => {
                        if (data) {
                            res.send("User Added Successfully");
                        }
                    }).catch((error) => {
                        if (error.code === 11000) {
                            res.status(409).send("Oops, you are Already a participant");
                        }
                    });
                }
        } else {
            res.status(500).send("Oops, it seems you are not part of IEEE.");
        }
    } catch (error) {
        console.log("errr", error);
        // if(error.keyPattern== "regId"){
        res.status(500).send("Duplicate Email Id")
        // }
    }
};

const totalAbsent = async (req, res) => {
    try {
        const volunteerId = req.volunteerId;

        console.log(volunteerId);
        let admin = await volunteerData.findOne({
            _id: volunteerId,
        });

        if (admin) {
                userData.count({
                    present: false
                }, function (err, numofDocs) {
                    if (err) {
                        res.status(500).send(err);
                        console.log(err);
                    }
                    console.log(numofDocs);
                    res.status(200).send({
                        count: numofDocs
                    });
                });
        } else {
            res.status(500).send("Oops, it seems you are not part of IEEE.");
        }
    } catch (err) {
        console.log(err);
    }
};

const uploadSheet = async (req, res) => {   
    try {
        // const eventId= req.body.eventId;
        const volunteerId = req.volunteerId;
        const eventId = req.query.eventId;
        console.log(volunteerId);
        console.log(eventId);
        let admin = volunteerData.findOne({
            _id: volunteerId,
        });

        if (admin) {       
                // Below code is to upload Sheet from 
                // console.log("files==>", req.files);
                let fileName = "";
                let storage = multer.diskStorage({
                    destination: function (req, file, callback) {
                        callback(null, "./uploads");
                    },
                    filename: function (req, file, callback) {
                        console.log(eventId);
                        fileName = file.fieldname + "-" + eventId + Date.now();
                        console.log(fileName);
                        callback(null, fileName);
                    },
                });
                
                // below code is to read the added data to DB from file
                var upload =  multer({
                    storage: storage
                }).single("file");
                
                upload(req, res, async function (err) {
                    if (err) {
                        return res.status(500).send(err);
                    } else {
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
                            userData.remove({}, async function (err, result) {
                                if (err) {
                                    console.log(err);
                                } else if (result) {
                                    console.log(result.deletedCount);
                                    documentCount = result.deletedCount;
                                }
                                console.log(documentCount, "count");
                                console.log(totalData, "totalCount");
                                if (totalData === documentCount) {
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
                                                // res.status(500).send(err.message);
                                            } else {
                                                sheetCount++;
                                                // console.log(count);
                                                console.log(sheetCount);
                                                if (sheetCount === sheetData.length) {
                                                    console.log("uploaded Successfully");
                                                    deleteFile(fileName);
                                                    res.status(200).send("Uploaded Successfully");
                                                }
                                            }
                                        });
                                    });
                                }
                            });
                            // console.log(sheetData.length);
                        }
                    }
                });
                // This below code is to delete All the files in the upload folder
                function deleteFile(deleteFile){
                    fs.readdir("./uploads", (err, files) => {
                        if (err) throw err;
                        for (const file of files) {
                            console.log("delete file===>",file);
                            console.log("delete file2===>",deleteFile);
                            if(file=== deleteFile){
                                fs.unlinkSync(`./uploads/${file}`, (err) => {
                                    if (err) throw err;
                                });
                                break;
                            }
                        }
                    });
                }

        } else {
            res.status(500).send("Oops, it seems you are not part of IEEE.");
        }
    } catch (error) {
        console.log("err", error);
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