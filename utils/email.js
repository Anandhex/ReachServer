const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
exports.sendMail = async options => {
  console.log('here');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: 'ReachOut CEO <reachOut@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html
    // text: htmlToText.fromString(
    //   <form method="POST">
    //     Password:
    //     <input type="password" name="password" />
    //     Confirm Password:
    //     <input type="password" name="passwordConfirm" />
    //   </form>
    // )
  };

  await transporter.sendMail(mailOptions);
};
