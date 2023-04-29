const nodemailer = require('nodemailer');
const path = require("path");
const ejs = require("ejs");
require("dotenv").config();
const logger = require("../utils/logger");

const verifyLink = process.env.ENV === "development" ? process.env.VERIFYLINKDEV : process.env.VERIFYLINKPROD;
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
    subject: 'IEEE QR Registration App Credentials',
    html: '',
    text: 'If the HTML template is not loaded then email provider does not support HTML. Please open in browser.'
};



const sendVerificationMail = async (name, adminMail, password) => {
    try {
        logger.debug("%s",password);
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
        await ejs.renderFile(path.join(path.resolve(), 'src/templates/verifyEmail.ejs'), {
            userName: name,
            password: password,
            verifyLink: verifyLink
        }).then(result => {
            mailOptions.html = result;
        });

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
        mailOptions.html = '';
    } catch (error) {
        logger.error(error)
    }
}


const sendSuccessfulVerifiedMail = async (name, adminMail) => {
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
        await ejs.renderFile(path.join(path.resolve(), 'src/templates/welcomeEmail.ejs'), {
            userName: name,
        }).then(result => {
            mailOptions.html = result;
        });
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
    sendVerificationMail,
    sendSuccessfulVerifiedMail
}