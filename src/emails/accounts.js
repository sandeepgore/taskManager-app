const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.API_USE_KEY)

const welcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'sandeepgore12@gmail.com',
        subject: 'welcome to task manager app',
        text: `welcome my app , ${name} we like you to joining us`
    })

}

const exitEmail = (email, name) => {

    sgMail.send({
        to: email,
        from: 'sandeepgore12@gmail.com',
        subject: 'thanks for used our app',
        text: `good bye ${name}, task manager app`
    })

}

module.exports = {
    welcomeEmail,
    exitEmail
}