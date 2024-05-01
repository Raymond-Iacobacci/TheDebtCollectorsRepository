const axios = require('axios');

async function sendEmail(recipient, subject, text) {
    try {
        const url = 'https://us-central1-thedebtcollectors.cloudfunctions.net/send-email';
        const response = await axios.post(url, {
            recipient: recipient,
            subject: subject,
            text: text
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

module.exports = {sendEmail};