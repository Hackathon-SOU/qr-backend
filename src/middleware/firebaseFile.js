const httpStatus = require("http-status");
const logger = require("../utils/logger");
const path = require("path");
const {
    storage,
    storageRef
} = require("../firebase.config/config.js");

const uploadFile = (req, res, next) => {
    let fileName = req.fileName;
    logger.info("req.fileName===> %s", req.fileName);
    let filePath = "../../public/tmp";
    logger.debug("path of upload sheet===>%o", filePath);
    res.status(httpStatus.OK).send({
        filePath: filePath
    });
}

module.exports = {
    uploadFile
}