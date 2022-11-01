const userData = require("../models/user");
const volunteerData = require("../models/member");


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
                }else{
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
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    getuserDetails,
    markpresence,
    singleUserData,
    totalAbsent
}