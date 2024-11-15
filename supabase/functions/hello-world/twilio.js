// Download the helper library from https://www.twilio.com/docs/node/install
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const contentSid = process.env.CONTENT_SID;
const messagingServiceSid = process.env.MESSAGING_SERVICE_SID;
const reportlahWhatsappNumber = process.env.REPORTLAH_WHATSAPP_NUMBER;
const client = twilio(accountSid, authToken);

export async function sendWhatsappMessage(
  shopWhatsappNumber,
  alertTime,
  alertReason
) {
  const message = await client.messages.create({
    contentSid,
    contentVariables: JSON.stringify({ 1: alertTime, 2: alertReason }),
    messagingServiceSid,
    from: reportlahWhatsappNumber,
    to: shopWhatsappNumber,
  });

  console.log(message);
}
