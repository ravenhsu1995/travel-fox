// One-off: apply migration 0013_assign_sample_owner.sql via service role.
// Equivalent operations (idempotent):
//   1. find ravenhsu1995@gmail.com in auth.users
//   2. update trips set owner_id, visibility='public',
//                       public_display_name (if null), share_show_feedback=false
//   3. strip rating/comment from every days.timeline item
//
// Run: node --env-file=.env.local scripts/apply-0013-assign-sample-owner.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing env vars. Run with: node --env-file=.env.local scripts/apply-0013-assign-sample-owner.mjs',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const SAMPLE_TRIP_ID = '00000000-0000-0000-0000-000000000001';
const TARGET_EMAIL = 'ravenhsu1995@gmail.com';

async function findOwnerByEmail(email) {
  const target = email.toLowerCase();
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error('listUsers failed: ' + error.message);
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function run() {
  console.log(`🔍  Looking up owner ${TARGET_EMAIL}...`);
  const owner = await findOwnerByEmail(TARGET_EMAIL);
  if (!owner) {
    console.error(
      `❌ ${TARGET_EMAIL} 尚未註冊。請先用該 email 登入過一次，再重新執行。`,
    );
    process.exit(1);
  }
  console.log(`   ✓ owner = ${owner.id}`);

  console.log('📝  Reading current trip state...');
  const { data: cur, error: ce } = await supabase
    .from('trips')
    .select('public_display_name')
    .eq('id', SAMPLE_TRIP_ID)
    .single();
  if (ce) throw new Error('Read trip failed: ' + ce.message);

  console.log('📝  Updating trip (owner / visibility / share_show_feedback)...');
  const patch = {
    owner_id: owner.id,
    visibility: 'public',
    share_show_feedback: false,
  };
  if (!cur.public_display_name) patch.public_display_name = '芒果狐狸';

  const { error: e1 } = await supabase
    .from('trips')
    .update(patch)
    .eq('id', SAMPLE_TRIP_ID);
  if (e1) throw new Error('Update trip failed: ' + e1.message);
  console.log(`   ✓ trip updated (display_name = ${cur.public_display_name || '芒果狐狸'})`);

  console.log('🧹  Stripping rating/comment from timeline items...');
  const { data: days, error: e2 } = await supabase
    .from('days')
    .select('id, date, timeline')
    .eq('trip_id', SAMPLE_TRIP_ID);
  if (e2) throw new Error('Read days failed: ' + e2.message);

  let strippedItems = 0;
  let touchedDays = 0;
  for (const day of days) {
    let dirty = false;
    const cleaned = (day.timeline || []).map((item) => {
      const { rating, comment, ...rest } = item;
      if (rating !== undefined || comment !== undefined) {
        strippedItems++;
        dirty = true;
      }
      return rest;
    });
    if (!dirty) continue;
    touchedDays++;
    const { error } = await supabase
      .from('days')
      .update({ timeline: cleaned })
      .eq('id', day.id);
    if (error) throw new Error(`Update day ${day.date} failed: ` + error.message);
  }
  console.log(
    `   ✓ stripped ${strippedItems} rating/comment fields across ${touchedDays}/${days.length} days`,
  );

  console.log('\n✅ 完成：2026 關西行 已指派給', TARGET_EMAIL);
}

run().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
