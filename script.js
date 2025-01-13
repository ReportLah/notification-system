import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// client.sync.v1.services.create().then((service) => console.log(service.sid));

client.sync.v1
  .services(process.env.GROUP_MESSAGING_SID)
  .syncMaps.create()
  .then((sync_map) => console.log(sync_map.sid));
