var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.DEFAULT_MAILER,
    pass: process.env.MAILER_PASSWORD
  }
});

// var mailOptions = {
//   from: thisUser.id,
//   to: 'abhishek21296@gmail.com',
//   subject: 'Sending Email using Node.js',
//   text: 'That was easy!'
// };

// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });

const SendWelcome = (toId, name) => {
    var mailOptions = {
        from: process.env.DEFAULT_MAILER,
        to: toId,
        subject: 'Welcome to My App',
        text: `Welcome to the app, ${name}. Let me know how you get along with it.`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

const SendThankYou = (to, name) => {
    var mailOptions = {
        from: process.env.DEFAULT_MAILER,
        to: to,
        subject: 'Thank you for your time with us.',
        text: `Let us know what else sgould we add to have you back as user, ${name}.`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = {
    SendWelcome : SendWelcome,
    SendThankYou : SendThankYou
}