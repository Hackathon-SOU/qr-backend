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
        let admin = volunteerData.findById({
            _id: volunteerId,
        });

        if (admin) {
            admin.then((user) => {
                console.log(user);
                userData.find({
                    regId: regId
                }).then((existingUser, err) => {
                    console.log(existingUser);
                    if (existingUser[0].present === true) {
                        // res.send(existingUser);
                        return res
                            .status(500)
                            .send(
                                "The person is already marked present. Please check your Registration Id."
                            );
                    } else {
                        return res.send(existingUser);
                    }
                });
            })
        } else {
            res.status(500).send("Oops, it seems you are not part of IEEE.");
        }

        // if (resJwt === true) {
        //     //   console.log(decoded.id, "decoded working");
        //     console.log(regId);
        //   
        // }
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .send(
                "There is no such Particpant here. Please check your Registration Id"
            );
    }
}

const markpresence = async (req, res) => {
    const regId = req.body.regId;
    const present = req.body.present;
    console.log(regId);
    console.log(present);
    try {
        const volunteerId = req.volunteerId;

        console.log(volunteerId);
        let admin = volunteerData.findById({
            _id: volunteerId,
        });

        if (admin) {
            admin.then((user) => {
                console.log("user===", user);
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
            });
        } else {
            res.status(500).send("Oops, it seems you are not part of IEEE.");
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

const singleUserData = async (req, res) => {
    try {
        const name = req.query.name;
        const email = req.query.email;
        const regId = req.query.regId;
        const seatNo = req.query.seatNo;
        const present = req.query.present;
        const volunteerId = req.volunteerId;

        console.log(volunteerId);
        let admin = volunteerData.findById({
            _id: volunteerId,
        });

        if (admin) {
            admin.then((user) => {
                console.log(user);
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
            });
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
        let admin = volunteerData.findById({
            _id: volunteerId,
        });

        if (admin) {
            admin.then((user) => {
                console.log(user);
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
            })
        } else {
            res.status(500).send("Oops, it seems you are not part of IEEE.");
        }
    } catch (err) {
        console.log(err);
    }
}

const uploadSheet = async (req, res) => {
    try {
        const volunteerId = req.volunteerId;

        console.log(volunteerId);
        let admin = volunteerData.findById({
            _id: volunteerId,
        });

        if (admin) {
            admin.then((user) => {
                console.log(user);
                fs.readdir("./uploads", (err, files) => {
                    if (err) throw err;
                    for (const file of files) {
                        fs.unlinkSync(`./uploads/${file}`, (err) => {
                            if (err) throw err;
                        });
                    }
                });
                console.log(req.files);
                let filename = "";
                let storage = multer.diskStorage({
                    destination: function (req, file, callback) {
                        callback(null, "./uploads");
                    },
                    filename: function (req, file, callback) {
                        filename = file.fieldname + "-" + Date.now();
                        console.log(filename);
                        callback(null, filename);
                    },
                });
                var upload = multer({
                    storage: storage
                }).single("file");
                // const file = req.body.file;
                // console.log(filename);
                upload(req, res, async function (err) {
                    if (err) {
                        return res.status(500).send(err);
                    } else {
                        var file = render.readFile(`./uploads/${filename}`);
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
            })
        } else {
            res.status(500).send("Oops, it seems you are not part of IEEE.");
        }
    } catch (error) {
        console.log("err", error);
    }
};


module.exports = {
    getuserDetails,
    markpresence,
    singleUserData,
    totalAbsent,
    uploadSheet,
}