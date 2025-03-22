const EmailConfig = require('./email-config.cjs');
const nodemailer = require("nodemailer");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Microsoft OAuth2 URLs
const MICROSOFT_OAUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

app.get("/auth")

// Generate authentication URL
function getAuthUrl() {
  return `${MICROSOFT_OAUTH_URL}?` + 
    `client_id=${EmailConfig.CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(EmailConfig.REDIRECT_URI)}` +
    `&response_mode=query` +
    `&scope=${encodeURIComponent('offline_access https://outlook.office.com/SMTP.Send')}`;
}

console.log("Authorize your app by visiting this URL:", getAuthUrl());

app.get('/auth/outlook/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Authorization code not received');
    }

    try {
        // Exchange authorization code for tokens
        const tokenResponse = await axios.post(MICROSOFT_TOKEN_URL,
        new URLSearchParams({
            client_id: EmailConfig.CLIENT_ID,
            client_secret: EmailConfig.CLIENT_SECRET,
            refresh_token: EmailConfig.REFRESH_TOKEN,
            expires_in: 3600,
            grant_type: 'refresh_token'
        }), {
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        const { access_token, refresh_token } = tokenResponse.data;
        
        // Save the new refresh token (update EmailConfig or store in DB)
        if (refresh_token) {
            EmailConfig.REFRESH_TOKEN = refresh_token;
            console.log("New refresh token saved:", refresh_token);
            fs.writeFileSync("./email-config.cjs", JSON.stringify(EmailConfig));

        }


        console.log("Access Token:", access_token);
        console.log("Refresh Token:", refresh_token);
        console.log("Token expires in:", expires_in, "seconds");
        
        res.send(`
        <h1>Authentication Successful!</h1>
        <p>Access Token and Refresh Token obtained. Check the server logs.</p>
        `);
    } catch (error) {
        console.error('Error exchanging code for tokens:', error.response?.data || error.message);
        res.status(500).send('Error obtaining tokens: ' + (error.response?.data?.error_description || error.message));
    }
});

// Function to refresh access token automatically
async function getAccessToken() {
  try {
    if (!EmailConfig.REFRESH_TOKEN) {
      throw new Error("Missing refresh token in configuration. Visit the URL above to obtain one.");
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
