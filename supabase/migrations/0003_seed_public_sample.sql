-- Seed: 2026 關西行 as the single public sample trip.
-- Idempotent: re-running replaces the sample trip and its days.

delete from days where trip_id = '00000000-0000-0000-0000-000000000001';
delete from expenses where trip_id = '00000000-0000-0000-0000-000000000001';
delete from trips where id = '00000000-0000-0000-0000-000000000001';

insert into trips (id, owner_id, title, subtitle, start_date, end_date, cover_emoji, is_public_sample) values (
  '00000000-0000-0000-0000-000000000001',
  null,
  '2026 關西行',
  '神戶 · 鳥取 · 岡山',
  '2026-05-02',
  '2026-05-10',
  '🗾',
  true
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-02',
  '5/2 (六)',
  '桃園 • 神戶',
  '{"name": "Hostel Anchorage 神戸", "checkin": "16:00", "checkout": null, "mapQ": "Hostel Anchorage 神戸 元町"}'::jsonb,
  '[{"time": "09:30", "type": "transport", "transport": {"tool": "飛機", "from": "桃園機場 T1", "to": "關西機場 T2", "duration": "2h50m", "note": "樂桃航空 MM24"}}, {"time": "13:20", "type": "transport", "transport": {"tool": "高速船", "from": "關西機場", "to": "神戶機場", "duration": "45–50min", "note": "Bay Shuttle"}}, {"time": "14:30", "type": "meal", "meal": {"type": "午餐", "name": "とんかつ七兵衛 三宮店", "dishes": "豬排飯"}}, {"time": "20:00", "type": "exp", "exp": {"headline": "神戶港塔夜景・海濱漫步", "spot": "神戶港塔・美利堅公園", "desc": "翻修重開的神戶地標，夜間燈光絕美，美利堅公園海濱散步無需門票"}}, {"time": "21:00", "type": "meal", "meal": {"type": "晚餐", "name": "鶏soba座銀 神戸本店", "dishes": "雞白湯/飛魚湯拉麵"}}]'::jsonb,
  0
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-03',
  '5/3 (日)',
  '神戶 • 明石',
  '{"name": "Hostel Anchorage 神戸", "checkin": null, "checkout": null, "mapQ": "Hostel Anchorage 神戸 元町"}'::jsonb,
  '[{"time": "09:15", "type": "transport", "transport": {"tool": "JR", "from": "三宮", "to": "明石", "duration": "35min", "note": "JR 神戶線"}}, {"time": "10:00", "type": "exp", "exp": {"headline": "熱鬧在地海鮮廚房", "spot": "魚之棚邊走邊吃", "desc": "魚之棚邊走邊吃：在地海鮮廚房採買"}}, {"time": "10:30", "type": "meal", "meal": {"type": "早餐", "name": "明石玉子焼 中々", "dishes": "明石燒"}}, {"time": "11:30", "type": "exp", "exp": {"headline": "高空透明海上漫步", "spot": "明石海峽大橋", "desc": "明石海峽大橋散步道：海上透明步道"}}, {"time": "12:30", "type": "meal", "meal": {"type": "午餐", "name": "こじゃんと2号店", "dishes": "土佐丼"}}, {"time": "14:30", "type": "exp", "exp": {"headline": "昭和風立飲居酒屋體驗", "spot": "三宮高架下酒場街", "desc": "融入在地夜晚文化，昭和風情高架下小店，氣氛獨特"}}, {"time": "15:30", "type": "meal", "meal": {"type": "點心", "name": "食ぱんの店 春夏+秋冬 三宮センタープラザ店", "dishes": "生甜甜圈＆吐司"}}, {"time": "20:00", "type": "meal", "meal": {"type": "晚餐", "name": "土佐清水ワールド 三宮生けすセンター", "dishes": "居酒屋"}}]'::jsonb,
  1
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-04',
  '5/4 (一)',
  '神戶 • 丹波篠山',
  '{"name": "Hostel Anchorage 神戸", "checkin": null, "checkout": "10:00", "mapQ": "Hostel Anchorage 神戸 元町"}'::jsonb,
  '[{"time": "09:15", "type": "transport", "transport": {"tool": "自駕", "from": "Hostel Anchorage 神戸", "to": "丹波篠山", "duration": "80min", "note": "租車自駕"}}, {"time": "10:30", "type": "exp", "exp": {"headline": "老街山產與黑豆甜品", "spot": "篠山老街", "desc": "篠山老街：烤山豬肉串、黑豆甜點"}}, {"time": "12:30", "type": "meal", "meal": {"type": "午餐", "name": "隣のビリケン", "dishes": "山豬肉烏龍麵、和牛丼"}}, {"time": "14:00", "type": "meal", "meal": {"type": "點心", "name": "YAKI-PON", "dishes": "烤栗子"}}, {"time": "14:30", "type": "exp", "exp": {"headline": "丹波篠山古城遺跡探訪", "spot": "篠山城跡", "desc": "丹波篠山的古城遺跡，大書院重建完整，登城眺望市區，歷史氛圍濃厚"}}, {"time": "16:30", "type": "meal", "meal": {"type": "下午茶", "name": "和の菓とパンと器 日に日に", "dishes": "手作麵包、自選杯子咖啡/果汁"}}, {"time": "19:30", "type": "meal", "meal": {"type": "晚餐", "name": "焼肉ホルモン まる久商店", "dishes": "燒肉"}}]'::jsonb,
  2
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-05',
  '5/5 (二)',
  '神戶 • 鳥取',
  '{"name": "Tottori Green Hotel Morris", "checkin": "15:00", "checkout": null, "mapQ": "グリーンホテルモーリス鳥取駅前"}'::jsonb,
  '[{"time": "08:30", "type": "meal", "meal": {"type": "早餐", "name": "放香堂加琲", "dishes": "咖啡、烤吐司"}}, {"time": "11:30", "type": "meal", "meal": {"type": "午餐", "name": "神戸牛らーめん 八坐和", "dishes": "和牛拉麵"}}, {"time": "18:30", "type": "transport", "transport": {"tool": "特急", "from": "三宮", "to": "鳥取", "duration": "2h10m", "note": "超級白兔號"}}, {"time": "21:30", "type": "meal", "meal": {"type": "晚餐", "name": "やきとり家 すみれ 鳥取店", "dishes": "串燒"}}]'::jsonb,
  3
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-06',
  '5/6 (三)',
  '鳥取',
  '{"name": "Tottori Green Hotel Morris", "checkin": null, "checkout": "11:00", "mapQ": "グリーンホテルモーリス鳥取駅前"}'::jsonb,
  '[{"time": "09:00", "type": "transport", "transport": {"tool": "巴士", "from": "鳥取駅", "to": "浦富", "duration": "40min", "note": "路線公車"}}, {"time": "10:00", "type": "exp", "exp": {"headline": "海上遊船穿梭奇岩", "spot": "浦富海岸遊覽船", "desc": "浦富海岸遊覽船：「山陰松島」海上絕景"}}, {"time": "12:30", "type": "meal", "meal": {"type": "午餐", "name": "鳥取砂丘会館門口", "dishes": "烤火雞腿"}}, {"time": "13:30", "type": "meal", "meal": {"type": "點心", "name": "いずみおじさんのソフトクリーム", "dishes": "大山冰淇淋"}}, {"time": "14:00", "type": "exp", "exp": {"headline": "壯闊砂丘攀登體驗", "spot": "鳥取砂丘", "desc": "親身攀爬日本最大沙丘，居高眺望日本海，感受壯闊沙漠風情"}}, {"time": "18:30", "type": "meal", "meal": {"type": "晚餐", "name": "回転すし北海道 駅南店", "dishes": "迴轉壽司"}}]'::jsonb,
  4
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-07',
  '5/7 (四)',
  '鳥取 • 岡山',
  '{"name": "Via Inn 岡山駅前", "checkin": "15:00", "checkout": null, "mapQ": "ヴィアイン岡山駅前"}'::jsonb,
  '[{"time": "12:30", "type": "meal", "meal": {"type": "午餐", "name": "まつやホルモン店", "dishes": "內臟炒麵、關東煮"}}, {"time": "14:00", "type": "transport", "transport": {"tool": "特急", "from": "鳥取", "to": "岡山", "duration": "1h50m", "note": "超級因幡號"}}, {"time": "19:30", "type": "meal", "meal": {"type": "晚餐", "name": "豚ステーキ専門店B イオンモール岡山店", "dishes": "烤豬肉定食"}}]'::jsonb,
  5
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-08',
  '5/8 (五)',
  '岡山 • 倉敷',
  '{"name": "Via Inn 岡山駅前", "checkin": null, "checkout": null, "mapQ": "ヴィアイン岡山駅前"}'::jsonb,
  '[{"time": "10:45", "type": "transport", "transport": {"tool": "JR", "from": "岡山", "to": "倉敷", "duration": "15min", "note": "山陽本線"}}, {"time": "12:30", "type": "meal", "meal": {"type": "午餐", "name": "倉敷うどん ぶっかけ ふるいち 仲店", "dishes": "烏龍麵"}}, {"time": "14:00", "type": "exp", "exp": {"headline": "倉敷守護神・阿智神社巡禮", "spot": "阿智神社", "desc": "鎮座倉敷美觀地區高台的古社，俯瞰白壁水鄉，氣氛靜謐"}}, {"time": "15:00", "type": "exp", "exp": {"headline": "倉敷文青巷弄尋寶", "spot": "倉敷美觀地區", "desc": "白壁老街與運河沿岸漫步，巷弄裡藏著質感小店與藝廊"}}, {"time": "16:30", "type": "transport", "transport": {"tool": "JR", "from": "倉敷", "to": "岡山", "duration": "15min", "note": "山陽本線"}}, {"time": "17:30", "type": "exp", "exp": {"headline": "日本三大名園靜謐遊", "spot": "後樂園與岡山城", "desc": "後樂園與岡山城：日本三大名園散策，入園至18:00"}}, {"time": "19:00", "type": "meal", "meal": {"type": "晚餐", "name": "和麺ぐり虎 Okayama", "dishes": "海老拉麵"}}]'::jsonb,
  6
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-09',
  '5/9 (六)',
  '岡山 • 日生',
  '{"name": "Via Inn 岡山駅前", "checkin": null, "checkout": "10:00", "mapQ": "ヴィアイン岡山駅前"}'::jsonb,
  '[{"time": "09:15", "type": "transport", "transport": {"tool": "JR", "from": "岡山", "to": "日生", "duration": "1h", "note": "赤穂線"}}, {"time": "10:30", "type": "exp", "exp": {"headline": "瀨戶內小漁港閒晃體驗", "spot": "日生港灣", "desc": "牡蠣養殖漁港散策，遠眺瀨戶內諸島，感受在地漁村氛圍"}}, {"time": "11:30", "type": "meal", "meal": {"type": "小午餐", "name": "日生名物 焼きあなごコーナー", "dishes": "鰻魚飯"}}, {"time": "13:00", "type": "meal", "meal": {"type": "午餐", "name": "ごはん家 ぼろ小屋", "dishes": "刺身定食、牡蠣"}}, {"time": "14:30", "type": "exp", "exp": {"headline": "俯瞰瀨戶內海敲幸福之鐘", "spot": "港見丘公園", "desc": "鳥瞰日生漁港與瀨戶內諸島，山丘頂有幸福之鐘，晴天視野絕美"}}, {"time": "16:30", "type": "transport", "transport": {"tool": "JR", "from": "日生", "to": "岡山", "duration": "1h", "note": "赤穂線"}}, {"time": "19:00", "type": "meal", "meal": {"type": "晚餐", "name": "Mori お好み焼きもり", "dishes": "大阪燒"}}]'::jsonb,
  7
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-10',
  '5/10 (日)',
  '岡山 • 桃園',
  null,
  '[{"time": "12:00", "type": "meal", "meal": {"type": "午餐", "name": "おかやま駅弁", "dishes": "火車便當"}}, {"time": "13:00", "type": "transport", "transport": {"tool": "利木津巴士", "from": "岡山西口", "to": "機場", "duration": "30min"}}, {"time": "15:55", "type": "transport", "transport": {"tool": "飛機", "from": "岡山機場", "to": "桃園機場 T1", "duration": "2h45m", "note": "台灣虎航 IT215"}}]'::jsonb,
  8
);
