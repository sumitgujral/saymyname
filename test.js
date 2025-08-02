// Using CommonJS require
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');
 // Make sure you have 'dotenv' installed for environment variables

// 1. Instantiate the MailerSend client with your actual API key from environment variables
const msClient = new MailerSend({
    apiKey: "mlsn.0f2b9fee7c228b8e2fa7ffb52a4b778d2bb477c7f80e0edff2ed085a9b424295", // Use environment variable for security
});

// 2. Define the sender. Ensure 'your_verified_domain.com' is a domain verified in MailerSend.
const sentFrom = new Sender("MS_ZTxU22@test-z0vklo60wqpl7qrx.mlsender.net", "Your Sender Name");

// 3. Define recipients
const recipients = [
    new Recipient("smtgjrl@gmail.com", "Recipient Name") // Replace with actual recipient email
];

// 4. Create the email parameters
const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    // .setReplyTo(sentFrom) // Optional, but good practice if replies go to a different address
    .setSubject("This is a Test Subject from Node.js")
    .setHtml("<strong>Greetings from the team!</strong> You received this message through MailerSend Node.js library.")
    .setText("Greetings from the team, you got this message through MailerSend Node.js library.");

// 5. Create an async function to send the email with error handling
async function sendVerificationEmail() {
    try {
        const response = await msClient.email.send(emailParams);
        console.log("Email sent successfully!");
        // console.log("MailerSend API Response:", response); // Uncomment this line if you want to see the success response
        return true;
    } catch (error) {
        console.error("Failed to send email. Full error object:", error); // <<< CHANGE THIS LINE
        // You can also stringify it for better readability if it's a complex object
        // console.error("Failed to send email. Full error object (JSON):", JSON.stringify(error, null, 2));
        return false;
    }
}

// 6. Call the function to send the email
// You would typically call this function from your registration route
// after a user successfully registers and you want to send a verification email.
sendVerificationEmail(); // This will execute the email sending when the script runs