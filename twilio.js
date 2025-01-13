// Download the helper library from https://www.twilio.com/docs/node/install
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const conversationSid = process.env.CONVERSATION_SID;
const contentSid = process.env.CONTENT_SID;
const reportlahWhatsappNumber = process.env.REPORTLAH_WHATSAPP_NUMBER;
const twilioServiceSid = process.env.TWILIO_SERVICE_SID;
const syncMapSid = process.env.SYNC_MAP_SID;
const messagingServiceSid = process.env.MESSAGING_SERVICE_SID;
const myWhatsappNumber = "whatsapp:+6581366963";

const client = twilio(accountSid, authToken);

export async function sendWhatsappMessage(time, shopName, reason, count) {
  console.log(
    `An alert has been triggered at ${time} @${shopName}! The reason is ${reason}. Number of reports is ${count}.`
  );
  const message = await client.messages.create({
    twilioServiceSid,
    contentSid,
    contentVariables: {
      1: time,
      2: shopName,
      3: reason,
      4: count,
    },
    from: reportlahWhatsappNumber,
    to: myWhatsappNumber,
  });

  console.log(message);
}

// const message = await client.messages.create({
//   contentSid,
//   contentVariables: JSON.stringify({ 1: "11:00", 2: "Bin" }),
//   conversationSid,
//   from: reportlahWhatsappNumber,
//   to: "whatsapp:+6581366963",
// });

// console.log(message);
