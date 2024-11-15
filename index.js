// Initialize the JS client
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { sendWhatsappMessage } from "./twilio.js";

dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const shopWhatsappNumber = "whatsapp:+6581366963";

// Create a function to handle inserts
const checkAggregates = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .gte("created_date", oneDayAgo);

  if (error) {
    console.error("Error fetching feedback:", error);
    return;
  }

  // Group feedback by shop_id and gender
  const groupedFeedback = data.reduce((acc, feedback) => {
    const key = `${feedback.shop_id}-${feedback.gender}`;
    if (!acc[key]) {
      acc[key] = {
        shop_id: feedback.shop_id,
        gender: feedback.gender,
        counts: {
          bin_full: 0,
          dirty_basin: 0,
          dirty_toilet_bowl: 0,
          dirty_mirror: 0,
          no_more_soap: 0,
          no_more_toilet_paper: 0,
          toilet_clogged: 0,
          wet_dirty_floor: 0,
        },
      };
    }

    // Count issues for this shop-gender combination
    Object.keys(acc[key].counts).forEach((issue) => {
      if (feedback[issue]) acc[key].counts[issue]++;
    });

    return acc;
  }, {});

  console.log(groupedFeedback);

  // Check thresholds for each shop-gender combination
  Object.values(groupedFeedback).forEach(({ shop_id, gender, counts }) => {
    Object.entries(counts).forEach(async ([issue, count]) => {
      if (count >= 3) {
        await sleep(1000);
        sendWhatsappMessage(shopWhatsappNumber, "6:19pm", "Dirty Basin");
        console.log(
          `Alert: ${issue} has been reported ${count} times in the last 24 hours for shop_id: ${shop_id}, gender: ${gender}`
        );
      }
    });
  });
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

const { error } = await supabase.from("feedback").insert({
  shop_id: 1,
  gender: "male",
  bin_full: true,
  dirty_basin: true,
  dirty_toilet_bowl: true,
  dirty_mirror: true,
  no_more_soap: true,
  no_more_toilet_paper: true,
  toilet_clogged: true,
  wet_dirty_floor: true,
});

if (error) {
  console.error("Error inserting feedback:", error);
} else {
  console.log("Feedback inserted successfully");
}
