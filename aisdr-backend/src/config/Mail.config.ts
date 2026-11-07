
const providers = {
    'gmail': {
        host: 'smtp.gmail.com',
        port: 587, // Standard SMTP port for Gmail
        secure: false, // StartTLS
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    },
    'local': {
        host: 'localhost', // Set to sandbox.smtp.mailtrap.io in .env
        port: 1025,
        secure: false
    },
    'bison': {
        token: process.env.EMAIL_BISON_TOKEN,
        senderEmailId: process.env.EMAIL_BISON_SENDER, 
    }
}

export default providers