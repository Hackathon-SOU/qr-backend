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
        mailOptions.to = adminMail;
        mailOptions.text = `Your Account for IEEE Qr App has been successfully created. Your MembershipId is ${membershipId} and password is ${password}`
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                logger.error(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (error) {
        logger.error(error)
    }
}

module.exports = {
    sendRegisterAdminMail
}