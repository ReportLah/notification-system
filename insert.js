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
  dirty_basin: false,
  dirty_toilet_bowl: false,
  dirty_mirror: false,
  no_more_soap: false,
  no_more_toilet_paper: false,
  toilet_clogged: false,
  wet_dirty_floor: false,
});

if (error) {
  console.error("Error inserting feedback:", error);
} else {
  console.log("Feedback inserted successfully");
}
