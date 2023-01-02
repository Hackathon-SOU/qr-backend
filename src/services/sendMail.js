const nodemailer = require('nodemailer');
require("dotenv").config();
const logger = require("../utils/logger");


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORDEMAIL
    }
});

let mailOptions = {
    from: 'noreply.ieeesousb.qr.app@gmail.com',
    to: '',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
};

const sendRegisterAdminMail = async (adminMail, membershipId, password) => {
    try {
        await new Promise((resolve, reject) => {
            // verify connection configuration
            transporter.verify(function (error, success) {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log("Server is ready to take our messages");
                    resolve(success);
                }
            });
        });
        mailOptions.to = adminMail;
        mailOptions.text = `Your Account for IEEE Qr App has been successfully created. Your MembershipId is ${membershipId} and password is ${password}`
        await new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    logger.error(error);
                    reject(err);
                } else {
                    logger.debug('Email sent: ' + info.response);
                    resolve(info);
                }
            });
        });
    } catch (error) {
        logger.error(error)
    }
}

module.exports = {
    sendRegisterAdminMail
}