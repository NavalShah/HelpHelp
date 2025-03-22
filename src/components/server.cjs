const TwilioAPIKey = require('./twilioAPIKey.cjs');
const { Twilio } = require("twilio");
const express = require("express");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const client = new Twilio(TwilioAPIKey.TWILIO_ACCOUNT_SID, TwilioAPIKey.TWILIO_AUTH_TOKEN);

app.post("/send-sms", async (req, res) => {
    console.log("request received");
    const { to, message } = req.body;
    try {
        console.log("sending response");
        const response = await client.messages.create({
            body: message,
            from: TwilioAPIKey.TWILIO_PHONE_NUMBER,
            to: TwilioAPIKey.MY_NUMBER,
        });
        console.log("no errors!");
        res.status(200).json({ success: true, response });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
