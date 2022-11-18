const multer = require("multer");
const path = require("path");

const multerUpload = async (req, res, next) => {
    console.log("request", req);

    let fileName = "";
    let storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, "./uploads");
        },
        filename: function (req, file, callback) {
            console.log("filename", file);
            fileName = file.fieldname + "-" + req.query.eventId + Date.now() + path.extname(file.originalname);
            callback(null, fileName);
        },
    });

    // below code is to read the added data to DB from file
    var upload = multer({
        storage: storage
    }).single("image");
    upload(req, res, async function (err) {
        if (err) {
            return res.status(500).send({
                message: err
            });
        } else {
            req.fileName = fileName;
            next();
        }
    })
}
module.exports = multerUpload;