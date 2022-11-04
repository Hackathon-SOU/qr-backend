const multer = require ("multer");

const multerUpload= async (req,res ,next) =>{
    let fileName = "";
    let storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, "./uploads");
        },
        filename: function (req, file, callback) {
            fileName = file.fieldname + "-" + req.body.eventId + Date.now();
            console.log(fileName);
            callback(null, fileName);
        },
    });
    
    // below code is to read the added data to DB from file
    var upload = multer({
        storage: storage
    }).single("file");
    upload(req, res, async function(err){
        if (err) {
            return res.status(500).send(err);
        } else {
            req.fileName=fileName;
            next();
        }
    })
}
module.exports = multerUpload;