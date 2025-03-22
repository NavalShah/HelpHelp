import express from "express";
import { Twilio}  from "twilio";
import dotenv from "dotenv";
import cors from "cors";
import TwilioAPIKey from './twilioAPIKey';

dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const client = new Twilio(TwilioAPIKey.TWILIO_ACCOUNT_SID, TwilioAPIKey.TWILIO_AUTH_TOKEN);

app.post("/send-sms", async (req, res) => {
    const { to, message } = req.body;
    try {
        const response = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
        res.status(200).json({ success: true, response });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
