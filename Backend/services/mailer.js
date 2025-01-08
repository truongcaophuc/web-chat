const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "phuctruong.310103@gmail.com",
    pass: process.env.GM_TOKEN,
  },
});






exports.sendEmail = async (args) => {
  transporter.sendMail(args, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Email sent: " + info.response);
  });
};