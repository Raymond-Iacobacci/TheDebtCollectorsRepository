const axios = require('axios');

async function sendMessage(recipient, message) {
    try {
        const url = 'https://us-central1-thedebtcollectors.cloudfunctions.net/send-message';
        const response = await axios.post(url, {
            recipient: recipient,
            body: message
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

module.exports = {sendMessage};