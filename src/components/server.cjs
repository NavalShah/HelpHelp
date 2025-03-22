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
const MICROSOFT_OAUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

// Route to start the OAuth2 process
app.get('/auth/outlook', (req, res) => {
  const authUrl = `${MICROSOFT_OAUTH_URL}?` + 
    `client_id=${EmailConfig.CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(EmailConfig.REDIRECT_URI)}` +
    `&response_mode=query` +
    `&scope=${encodeURIComponent('offline_access https://outlook.office.com/SMTP.Send')}`;
  
  res.redirect(authUrl);
});

// Route that handles the OAuth2 callback
app.get('/auth/outlook/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('Authorization code not received');
  }
  
  try {
    // Exchange authorization code for tokens
    const response = await axios.post(MICROSOFT_TOKEN_URL, 
      new URLSearchParams({
        client_id: EmailConfig.CLIENT_ID,
        client_secret: EmailConfig.CLIENT_SECRET,
        code: code,
        redirect_uri: EmailConfig.REDIRECT_URI,
        grant_type: 'authorization_code'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const { access_token, refresh_token, expires_in } = response.data;
    
    // Display the tokens (in a real app, you would securely store these)
    res.send(`
      <h1>Authentication Successful!</h1>
      <p>Copy these tokens to your configuration file:</p>
      <p><strong>Access Token:</strong> ${access_token}</p>
      <p><strong>Refresh Token:</strong> ${refresh_token}</p>
      <p><strong>Expires In:</strong> ${expires_in} seconds</p>
    `);
    
  } catch (error) {
    console.error('Error exchanging code for tokens:', error.response?.data || error.message);
    res.status(500).send('Error obtaining tokens: ' + (error.response?.data?.error_description || error.message));
  }
});

// Function to send an email with OAuth2
async function sendEmail(to, subject, message) {
  try {
    // First, get a fresh access token using the refresh token
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
    
    const { access_token } = tokenResponse.data;
    
    // Create a transporter with the access token
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        type: 'OAuth2',
        user: EmailConfig.EMAIL_USER,
        accessToken: access_token
      }
    });
    
    // Send the email
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
  let subject = "(High Priority) Alert"
  
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

app.post("/write-call-log", async (req, res) => {
    console.log("Write call log request received");
    const { userInputs, aiOutputs } = req.body;

    if (!userInputs || !aiOutputs) {
        return res.status(400).json({
            success: false,
            error: "User inputs and AI outputs are required",
        });
    }

    const csvData = [
        ["User Input", "AI Output"],
        ...userInputs.map((input, index) => [input, aiOutputs[index] || ""]),
    ].map(row => row.join(",")).join("\n");

    try {
        require('fs').writeFileSync("logs/call_log.csv", csvData);
        res.status(200).json({ success: true, message: "Call log written successfully" });
    } catch (error) {
        console.error("Error writing call log:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`To authorize with Outlook, visit: http://localhost:${port}/auth/outlook`);
});
