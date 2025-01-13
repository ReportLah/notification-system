import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

