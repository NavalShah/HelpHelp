const EmailConfig = require('./email-config.cjs');
const nodemailer = require("nodemailer");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Microsoft OAuth2 URLs
const MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

// Function to refresh access token automatically
async function getAccessToken() {
  try {
    if (!EmailConfig.REFRESH_TOKEN) {
      throw new Error("Missing refresh token in configuration.");
    }
    
    const tokenResponse = await axios.post(MICROSOFT_TOKEN_URL,
      new URLSearchParams({
        client_id: EmailConfig.CLIENT_ID,
        client_secret: EmailConfig.CLIENT_SECRET,
        refresh_token: EmailConfig.REFRESH_TOKEN,
        grant_type: 'refresh_token'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    return tokenResponse.data.access_token;
  } catch (error) {
    console.error("Error refreshing access token:", error.response?.data || error.message);
    throw error;
  }
}

// Function to send an email with OAuth2
async function sendEmail(to, subject, message) {
  try {
    const access_token = await getAccessToken();
    
    const transporter = nodemailer.createTransport({
      service: 'Outlook365',
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        type: 'OAuth2',
        user: EmailConfig.EMAIL_USER,
        accessToken: access_token
      }
    });
    
    const info = await transporter.sendMail({
      from: EmailConfig.EMAIL_USER,
      to: to,
      subject: subject || "New Message",
      text: message
    });
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

app.post("/send-email", async (req, res) => {
  console.log("Request received");
  const { message } = req.body;
  let to = "tangiralasaketh@gmail.com";
  let subject = "(High Priority) Alert";
  
  if (!to || !message) {
    return res.status(400).json({ 
      success: false, 
      error: "Email recipient and message are required" 
    });
  }
  
  try {
    console.log("Attempting to send email to:", to);
    const info = await sendEmail(to, subject, message);
    
    console.log("Email sent successfully:", info.messageId);
    res.status(200).json({ 
      success: true, 
      messageId: info.messageId,
      response: info.response 
    });
  } catch (error) {
    console.log("Email sending failed:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
