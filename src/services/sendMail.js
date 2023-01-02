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
    subject: 'IEEE QR Registration App Credentials',
    html: '<html><title>Silver Oak University IEEE SB</title><meta name="viewport" content="width=device-width,initial-scale=1"><body align="center" style="padding: 0px;margin: 0 auto;background-color: #ececec;"> <center> <table rules="NONE " align="center " cellspacing="0 " cellpadding="0 " bgcolor="#ffffff " style="margin: 0 auto;width: 600px;padding:0px;display: inline-block;"> <tr> <td align="center " style="padding:0;font-size:0px;"><img src="http://ieee.socet.edu.in/wp-content/uploads/2022/12/header-01-3.png" alt="Logo" width="600" align="center " border="0 "></td></tr><tr style="background-color: #25505d"> <td> <table rules="NONE " align="center " cellspacing="0 " cellpadding="50"> <td align="center " style="border-radius:20px;font-size:0;padding:50px 50px 50px 50px"> <img src="http://ieee.socet.edu.in/wp-content/uploads/2022/12/Artboard-1@0.5x-100.jpg" alt="Samvaad 2022 – Awareness on Cyber Security, Data Privacy & Cyber Law " style="border-radius:20px;" width="500"> </td></table> </td></tr><tr> <td style="font-family: Open Sans, sans-serif; font-size: 18px; line-height: 25px; letter-spacing: 0.5px; color: #3c4043; text-align: left; padding: 40px; " align="left "> <p> Dear <b>##Name##,</b><br>Greetings from <b> Silver Oak University IEEE Student Branch and QR Registration App Team.</b> </p><p style="text-align: justify;">Your Account has been Successfully created. You credentials are mentioned below. <ul> <li><b>MembershipId:</b> ##Membershipid##</li><li><b>Password:</b> ##Password##</li></ul> </p><p> If you have any queries then please reply to this email or send an email with image if you are facing any issues. </p><p> With Regards, <br><b> Silver Oak University IEEE Student Branch.</b> </p></td></tr><tr> <td style="font-family: Open Sans,sans-serif;font-size: 20px;letter-spacing: 0.5px;color: #ffffff;background-color:#d2d2d2;text-align: center;padding: 0px;margin:0 auto;width: 600px;"> <table rules="NONE " align="center " cellspacing="0 " cellpadding="0 " style="border-spacing: 0px;"> <tbody> <tr style="background-color: #666666;"> <td> <table> <tr> <td style="padding:10px 10px 0px 10px;color:#ffffff;text-align:center;width:600px;"> <p style="font-family: Open Sans,sans-serif;margin:0px;font-size:23"> <b>Follow us</b> </p></td></tr><tr> <td style="color:#ffffff;text-align:center;width:600px;"> <table align="center"> <td style="padding:20px;"><a href="http://ieee.silveroakuni.ac.in/" target="_blank " rel="noopener noreferrer"><img src="http://ieee.socet.edu.in/wp-content/uploads/2020/10/Web.png" width="25"/></a> </td><td style="padding:20px;"><a href="https://twitter.com/IEEE_SilverOak" target="_blank " rel="noopener noreferrer"><img src="http://ieee.socet.edu.in/wp-content/uploads/2020/10/013-twitter-1.png" width="25"/></a> </td><td style="padding:20px;"><a href="https://www.facebook.com/IEEESilverOakUni" target="_blank " rel="noopener noreferrer"><img src="http://ieee.socet.edu.in/wp-content/uploads/2020/10/045-facebook.png" width="25"/></a> </td><td style="padding:20px;"><a href="https://www.instagram.com/ieee_silveroakuni/" target="_blank " rel="noopener noreferrer"><img src="http://ieee.socet.edu.in/wp-content/uploads/2020/10/034-instagram.png" width="25"/></a> </td><td style="padding:20px;"><a href="https://www.linkedin.com/company/ieee-silveroakuni/" target="_blank " rel="noopener noreferrer"><img src="http://ieee.socet.edu.in/wp-content/uploads/2020/10/031-linkedin.png" width="25"/></a> </td></tr></table> </td></tr></tbody> </table> </td></tr><tr> <td style="text-align: left;padding: 40px 40px 20px 40px;background-color: #d2d2d2;"> <img src="http://ieee.socet.edu.in/wp-content/uploads/2020/05/IEEE-New-Logo-Blue.png" width="350"/> <p style="font-family: Open Sans,sans-serif;margin:0px;padding: 10px;color: #3c4043;font-size: 14px;"> <br>Silver Oak University,<br>352,353 A , Nr. Bhavik Publications,<br>Opp. Bhagwat Vidyapith, S.G.Highway,<br>Ahmedabad, Gujarat - 382481 </p><p style="font-family: Open Sans,sans-serif;margin:0px;padding: 10px 10px 0px 10px;color: #3c4043;font-size: 12px;"> You have received this email as you have registered for the above mentioned event. </p></td></tr><tr> <td style="font-family: Calibri,sans-serif;font-size: 10px;color: #e7e7e7;background-color:#666666;text-align: center;padding: 10px;"> Copyright © 2022 Silver Oak University. All Rights Reserved. </td></tr></tbody> </table> </td></tr></table> </center> </body></html>'
};

const sendRegisterAdminMail = async (name, adminMail, membershipId, password) => {
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
        mailOptions.html = mailOptions.html.replace('##Membershipid##', membershipId);
        mailOptions.html = mailOptions.html.replace('##Name##', name);
        mailOptions.html = mailOptions.html.replace('##Password##', password);
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