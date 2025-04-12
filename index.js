// Initialize the JS client
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { sendWhatsappMessage } from "./twilio.js";

dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ALERT_COUNT_THRESHOLD = 3;
const reasonMap = {
  bin_full: "bin full",
  dirty_basin: "sink dirty",
  dirty_toilet_bowl: "flush not working",
  dirty_mirror: "dirty mirror",
  no_more_soap: "no more soap",
  no_more_toilet_paper: "no more toilet paper",
  toilet_clogged: "toilet clogged",
  wet_dirty_floor: "floor wet",
};

const listOfReasons = [
  "bin_full",
  "dirty_basin",
  "dirty_toilet_bowl",
  "dirty_mirror",
  "no_more_soap",
  "no_more_toilet_paper",
  "toilet_clogged",
  "wet_dirty_floor",
];

// Create a function to handle inserts
const checkAggregates = async (payload) => {
  console.log(payload);

  if (payload.eventType !== "INSERT" || payload.table !== "feedback") return;

  const newFeedback = payload.new;
  const reason = listOfReasons.find((reason) => newFeedback[reason] === true);

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("shop_id", newFeedback.shop_id)
    .eq(reason, true)
    .gte("created_date", oneDayAgo);

  if (error) {
    console.error("Error fetching feedback data:", error);
  }

  const numFeedbacksForShopReason = data.length;

  // Only send the alert if the count is equal to the threshold, no further messages if it exceeds the threshold
  if (numFeedbacksForShopReason % ALERT_COUNT_THRESHOLD === 0) {
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, "0");
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");
    const timeString = `${hours}:${minutes}`;

    // Replace the find operation with direct Supabase query
    const { data: shopData, error: shopError } = await supabase
      .from("shop")
      .select("*")
      .eq("id", newFeedback.shop_id)
      .single();

    if (shopError) {
      console.error("Error fetching shop data:", shopError);
      return;
    }

    const reasonString = reasonMap[reason];

    await sendWhatsappMessage(
      `whatsapp:+65${shopData.contact}`,
      timeString,
      shopData.name,
      reasonString,
      numFeedbacksForShopReason
    );
    await sleep(1000);
  }
};

const sleep = async (ms) =>
  await new Promise((resolve) => setTimeout(resolve, ms)); // Wait for 100ms

// Helper function to wait until subscription state is "joined"
const waitForSubscription = async (subscription) => {
  while (subscription.state !== "joined") {
    await sleep(100); // Wait for 100ms
  }
  console.log("Subscription joined");
};

// Define the channel and subscribe to it
const channel = supabase
  .channel("feedback")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "feedback" },
    checkAggregates
  );

// Await the subscription and wait for it to be fully subscribed
const subscription = await channel.subscribe();
await waitForSubscription(subscription);
