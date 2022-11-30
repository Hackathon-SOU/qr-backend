const multer = require("multer");
const path = require("path");


const logger = require("../utils/logger");

const multerUpload = async (req, res, next) => {
    let fileName = "";
    let storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, "./uploads");
        },
        filename: function (req, file, callback) {
            fileName = file.fieldname + "-" + req.query.eventId + Date.now() + path.extname(file.originalname);
            logger.info("filename of uploadSheet===> %s", fileName);
            callback(null, fileName);
        },
    });

    // below code is to read the added data to DB from file
    var upload = multer({
        storage: storage
    }).single("sheet");
    upload(req, res, async function (err) {
        if (err) {
            logger.error("upload multer error =====> %o", error)
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