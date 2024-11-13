// Download the helper library from https://www.twilio.com/docs/node/install
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function createMessage() {
  const message = await client.messages.create({
    contentSid: "HX6fd76d4441352be043115aaa9648ef7c",
    contentVariables: JSON.stringify({ 1: "6:19PM", 2: "Dirty Basin" }),
    messagingServiceSid: "MG0e6b44dc5b9092d94d61b77fb84ae919",
    from: "whatsapp:+6598698399",
    to: "whatsapp:+6580336612",
  });

  console.log(message);
}

createMessage();
