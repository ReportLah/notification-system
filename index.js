// Initialize the JS client
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create a function to handle inserts
const handleInserts = (payload) => {
  console.log("Change received!", payload);
};

// Listen to inserts
supabase
  .channel("feedback")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "feedback" },
    handleInserts
  )
  .subscribe();

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

console.log(error);
