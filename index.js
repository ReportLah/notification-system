// Initialize the JS client
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { sendWhatsappMessage } from "./twilio.js";

dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ALERT_COUNT_THRESHOLD = 12;
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

const { data, err } = await supabase.from("shop").select("*");
const shopData = data;
if (err) {
  console.error("Error fetching shop data:", err);
} else {
  // console.log("Shop data:", shopData);
}

// Create a function to handle inserts
const checkAggregates = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .gte("created_date", oneDayAgo);

  const feedbackData = data;
  // console.log("Feedback data:", feedbackData);
  if (error) {
    console.error("Error fetching feedback:", error);
    return;
  }

  // Group feedback by shop_id and gender
  const groupedFeedback = feedbackData.reduce((acc, feedback) => {
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
    Object.entries(counts).forEach(async ([reason, count]) => {
      if (reason !== "bin_full") return;
      if (count >= ALERT_COUNT_THRESHOLD) {
        await sleep(1000);

        const currentTime = new Date();
        const hours = currentTime.getHours().toString().padStart(2, "0");
        const minutes = currentTime.getMinutes().toString().padStart(2, "0");
        const timeString = `${hours}:${minutes}`;

        const shopName = shopData.find((shop) => shop.id === shop_id).name;

        const reasonString = reasonMap[reason];

        console.log(shopName);

        sendWhatsappMessage(timeString, shopName, reasonString, count);
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

// const { error } = await supabase.from("feedback").insert({
//   shop_id: 1,
//   gender: "male",
//   bin_full: true,
//   dirty_basin: true,
//   dirty_toilet_bowl: true,
//   dirty_mirror: true,
//   no_more_soap: true,
//   no_more_toilet_paper: true,
//   toilet_clogged: true,
//   wet_dirty_floor: true,
// });

// if (error) {
//   console.error("Error inserting feedback:", error);
// } else {
//   console.log("Feedback inserted successfully");
// }
