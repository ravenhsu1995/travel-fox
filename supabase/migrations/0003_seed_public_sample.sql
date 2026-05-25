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
  '[{"time":"09:30","label":"搭機啟程","mapQ":"台湾桃園国際空港 第1ターミナル","transport":[{"tool":"飛機","from":"桃園機場 T1","fromQ":"台湾桃園国際空港 第1ターミナル","to":"關西機場 T2","toQ":"関西国際空港 第2ターミナル","duration":"2小時50分","note":"樂桃航空 MM24"}]},{"time":"13:20","label":"落地入境","mapQ":"関西国際空港 第2ターミナル","transport":[{"tool":"高速船","from":"關西機場","fromQ":"関西国際空港 第2ターミナル","to":"神戶機場","toQ":"神戸空港 ポートライナー 神戸空港駅","duration":"45–50分鐘","note":"Bay Shuttle","recommended":true}]},{"time":"14:30","label":"午餐","meals":[{"type":"午餐","name":"とんかつ七兵衛 三宮店","dishes":"豬排飯"}]},{"time":"20:00","label":"神戶港夜色","mapQ":"メリケンパーク 神戸港","exps":[{"headline":"神戶港塔夜景・海濱漫步","spot":"神戶港塔・美利堅公園","desc":"翻修重開的神戶地標，夜間燈光絕美，美利堅公園海濱散步無需門票","mapQ":"神戸ポートタワー 美利堅公園"}]},{"time":"21:00","label":"晚餐","meals":[{"type":"晚餐","name":"鶏soba座銀 神戸本店","dishes":"雞白湯/飛魚湯拉麵"}]}]'::jsonb,
  0
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-03',
  '5/3 (日)',
  '神戶 • 明石',
  '{"name": "Hostel Anchorage 神戸", "checkin": null, "checkout": null, "mapQ": "Hostel Anchorage 神戸 元町"}'::jsonb,
  '[{"time": "09:15", "label": "從飯店出發", "mapQ": "Hostel Anchorage 神戸 元町", "transport": [{"tool": "JR", "from": "三宮", "fromQ": "三ノ宮駅", "to": "明石", "toQ": "明石駅", "duration": "約35分", "note": "JR 神戶線", "recommended": true}]}, {"time": "10:00", "label": "熱鬧在地海鮮廚房", "mapQ": "魚之棚 明石市", "exps": [{"headline": "熱鬧在地海鮮廚房", "spot": "魚之棚邊走邊吃", "desc": "魚之棚邊走邊吃：在地海鮮廚房採買", "mapQ": "魚之棚邊走邊吃"}]}, {"time": "10:30", "label": "早餐", "meals": [{"type": "早餐", "name": "明石玉子焼 中々", "dishes": "明石燒"}]}, {"time": "11:30", "label": "高空透明海上漫步", "mapQ": "明石海峽大橋", "exps": [{"headline": "高空透明海上漫步", "spot": "明石海峽大橋", "desc": "明石海峽大橋散步道：海上透明步道", "mapQ": "明石海峽大橋"}]}, {"time": "12:30", "label": "午餐", "meals": [{"type": "午餐", "name": "こじゃんと2号店", "dishes": "土佐丼"}]}, {"time": "14:30", "label": "昭和風立飲居酒屋體驗", "mapQ": "三宮高架下 居酒屋 神戸市", "exps": [{"headline": "昭和風立飲居酒屋體驗", "spot": "三宮高架下酒場街", "desc": "融入在地夜晚文化，昭和風情高架下小店，氣氛獨特", "mapQ": "三宮高架下 居酒屋 神戸市"}]}, {"time": "15:30", "label": "點心", "meals": [{"type": "點心", "name": "食ぱんの店 春夏+秋冬 三宮センタープラザ店", "dishes": "生甜甜圈＆吐司"}]}, {"time": "20:00", "label": "晚餐", "meals": [{"type": "晚餐", "name": "土佐清水ワールド 三宮生けすセンター", "dishes": "居酒屋"}]}]'::jsonb,
  1
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-04',
  '5/4 (一)',
  '神戶 • 丹波篠山',
  '{"name": "Hostel Anchorage 神戸", "checkin": null, "checkout": "10:00", "mapQ": "Hostel Anchorage 神戸 元町"}'::jsonb,
  '[{"time": "09:15", "label": "從飯店出發", "mapQ": "Hostel Anchorage 神戸 元町", "transport": [{"tool": "自駕", "from": "Hostel Anchorage 神戸", "fromQ": "Hostel Anchorage 神戸 元町", "to": "丹波篠山", "toQ": "丹波篠山市", "duration": "約80分", "note": "租車自駕", "recommended": true}]}, {"time": "10:30", "label": "篠山老街探訪", "mapQ": "篠山老街", "exps": [{"headline": "老街山產與黑豆甜品", "spot": "篠山老街", "desc": "篠山老街：烤山豬肉串、黑豆甜點", "mapQ": "篠山老街"}]}, {"time": "12:30", "label": "午餐", "meals": [{"type": "午餐", "name": "隣のビリケン", "dishes": "山豬肉烏龍麵、和牛丼"}]}, {"time": "14:00", "label": "點心", "meals": [{"type": "點心", "name": "YAKI-PON", "dishes": "烤栗子"}]}, {"time": "14:30", "label": "篠山城跡巡禮", "mapQ": "篠山城跡 丹波篠山市", "exps": [{"headline": "丹波篠山古城遺跡探訪", "spot": "篠山城跡", "desc": "丹波篠山的古城遺跡，大書院重建完整，登城眺望市區，歷史氛圍濃厚", "mapQ": "篠山城跡 丹波篠山市"}]}, {"time": "19:30", "label": "晚餐", "meals": [{"type": "晚餐", "name": "焼肉ホルモン まる久商店", "dishes": "燒肉"}]}]'::jsonb,
  2
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-05',
  '5/5 (二)',
  '神戶 • 鳥取',
  '{"name": "Tottori Green Hotel Morris", "checkin": "15:00", "checkout": null, "mapQ": "グリーンホテルモーリス鳥取駅前"}'::jsonb,
  '[{"time":"08:30","label":"早餐","meals":[{"type":"早餐","name":"放香堂加琲","dishes":"咖啡、烤吐司"}]},{"time":"11:30","label":"午餐","meals":[{"type":"午餐","name":"神戸牛らーめん 八坐和","dishes":"和牛拉麵"}]},{"time":"18:30","label":"鐵道悠閒北上山陰","mapQ":"三ノ宮駅 神戸市","transport":[{"tool":"特急","from":"三宮","fromQ":"三宮","to":"鳥取","toQ":"グリーンホテルモーリス鳥取駅前","duration":"2h10m","note":"超級白兔號","recommended":true}]},{"time":"21:30","label":"晚餐","meals":[{"type":"晚餐","name":"やきとり家 すみれ 鳥取店","dishes":"串燒"}]}]'::jsonb,
  3
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-06',
  '5/6 (三)',
  '鳥取',
  '{"name": "Tottori Green Hotel Morris", "checkin": null, "checkout": "11:00", "mapQ": "グリーンホテルモーリス鳥取駅前"}'::jsonb,
  '[{"time": "09:00", "label": "從飯店出發", "mapQ": "グリーンホテルモーリス鳥取駅前", "transport": [{"tool": "巴士", "from": "鳥取駅", "fromQ": "鳥取駅", "to": "浦富", "toQ": "浦富", "duration": "40分", "note": "路線公車", "recommended": true}]}, {"time": "10:00", "label": "山陰松島海岸絕景", "mapQ": "浦富海岸", "exps": [{"headline": "海上遊船穿梭奇岩", "spot": "浦富海岸遊覽船", "desc": "浦富海岸遊覽船：「山陰松島」海上絕景", "mapQ": "浦富海岸遊覽船"}]}, {"time": "12:30", "label": "午餐", "meals": [{"type": "午餐", "name": "鳥取砂丘会館門口", "dishes": "烤火雞腿"}]}, {"time": "13:30", "label": "點心", "meals": [{"type": "點心", "name": "いずみおじさんのソフトクリーム", "dishes": "大山冰淇淋"}]}, {"time": "14:00", "label": "鳥取砂丘探秘", "mapQ": "鳥取砂丘", "exps": [{"headline": "壯闊砂丘攀登體驗", "spot": "鳥取砂丘", "desc": "親身攀爬日本最大沙丘，居高眺望日本海，感受壯闊沙漠風情", "mapQ": "鳥取砂丘"}]}, {"time": "18:30", "label": "晚餐", "meals": [{"type": "晚餐", "name": "回転すし北海道 駅南店", "dishes": "迴轉壽司"}]}]'::jsonb,
  4
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-07',
  '5/7 (四)',
  '鳥取 • 岡山',
  '{"name": "Via Inn 岡山駅前", "checkin": "15:00", "checkout": null, "mapQ": "ヴィアイン岡山駅前"}'::jsonb,
  '[{"time":"12:30","label":"鳥取惜別午宴","meals":[{"type":"午餐","name":"まつやホルモン店","dishes":"內臟炒麵、關東煮"}]},{"time":"14:00","label":"搭特急前往岡山","mapQ":"鳥取駅","transport":[{"tool":"特急","from":"鳥取","fromQ":"鳥取","to":"岡山","toQ":"ヴィアイン岡山駅前","duration":"1h50m","note":"超級因幡號","recommended":true}]},{"time":"19:30","label":"晚餐","meals":[{"type":"晚餐","name":"豚ステーキ専門店B イオンモール岡山店","dishes":"烤豬肉定食"}]}]'::jsonb,
  5
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-08',
  '5/8 (五)',
  '岡山 • 倉敷',
  '{"name": "Via Inn 岡山駅前", "checkin": null, "checkout": null, "mapQ": "ヴィアイン岡山駅前"}'::jsonb,
  '[{"time": "10:45", "label": "從飯店出發", "mapQ": "ヴィアイン岡山駅前", "transport": [{"tool": "JR", "from": "岡山", "fromQ": "岡山駅", "to": "倉敷", "toQ": "倉敷美觀地區", "duration": "直達 15分", "note": "山陽本線", "recommended": true}]}, {"time": "12:30", "label": "午餐", "meals": [{"type": "午餐", "name": "倉敷うどん ぶっかけ ふるいち 仲店", "dishes": "烏龍麵"}]}, {"time": "14:00", "label": "阿智神社巡禮", "mapQ": "阿智神社 倉敷市", "exps": [{"headline": "倉敷守護神・阿智神社巡禮", "spot": "阿智神社", "desc": "鎮座倉敷美觀地區高台的古社，俯瞰白壁水鄉，氣氛靜謐", "mapQ": "阿智神社 倉敷市"}]}, {"time": "15:00", "label": "倉敷文青巷弄尋寶", "mapQ": "倉敷美觀地區 倉敷運河周邊"}, {"time": "16:30", "label": "倉敷川夜間浪漫點燈", "mapQ": "倉敷美観地区 倉敷川 ライトアップ", "transport": [{"tool": "JR", "from": "倉敷", "fromQ": "倉敷", "to": "岡山", "toQ": "岡山", "duration": "15分", "note": "山陽本線"}]}, {"time": "17:30", "label": "後樂園 & 岡山城散策", "mapQ": "後楽園 岡山市", "exps": [{"headline": "日本三大名園靜謐遊", "spot": "後樂園與岡山城", "desc": "後樂園與岡山城：日本三大名園散策，入園至18:00", "mapQ": "後楽園 岡山市"}]}, {"time": "19:00", "label": "晚餐", "meals": [{"type": "晚餐", "name": "和麺ぐり虎 Okayama", "dishes": "海老拉麵"}]}]'::jsonb,
  6
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-09',
  '5/9 (六)',
  '岡山 • 日生',
  '{"name": "Via Inn 岡山駅前", "checkin": null, "checkout": "10:00", "mapQ": "ヴィアイン岡山駅前"}'::jsonb,
  '[{"time": "09:15", "label": "從飯店出發", "mapQ": "ヴィアイン岡山駅前", "transport": [{"tool": "JR", "from": "岡山", "fromQ": "岡山駅", "to": "日生", "toQ": "日生駅 備前市", "duration": "約1時間", "note": "赤穂線", "recommended": true}]}, {"time": "10:30", "label": "日生港灣漫步", "mapQ": "日生漁港 備前市", "exps": [{"headline": "瀨戶內小漁港閒晃體驗", "spot": "日生港灣", "desc": "牡蠣養殖漁港散策，遠眺瀨戶內諸島，感受在地漁村氛圍", "mapQ": "日生漁港 備前市"}]}, {"time": "11:30", "label": "小午餐", "meals": [{"type": "小午餐", "name": "日生名物 焼きあなごコーナー", "dishes": "鰻魚飯"}]}, {"time": "13:00", "label": "午餐", "meals": [{"type": "午餐", "name": "ごはん家 ぼろ小屋", "dishes": "刺身定食、牡蠣"}]}, {"time": "14:30", "label": "港見丘公園・幸福之鐘", "mapQ": "港見ヶ丘公園 備前市", "exps": [{"headline": "俯瞰瀨戶內海敲幸福之鐘", "spot": "港見丘公園", "desc": "鳥瞰日生漁港與瀨戶內諸島，山丘頂有幸福之鐘，晴天視野絕美", "mapQ": "港見ヶ丘公園 備前市"}]}, {"time": "16:30", "label": "鐵道返回岡山", "mapQ": "日生駅 備前市", "transport": [{"tool": "JR", "from": "日生", "fromQ": "日生駅 備前市", "to": "岡山", "toQ": "岡山駅", "duration": "約1時間", "note": "赤穂線", "recommended": true}]}, {"time": "19:00", "label": "晚餐", "meals": [{"type": "晚餐", "name": "Mori お好み焼きもり", "dishes": "大阪燒"}]}]'::jsonb,
  7
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-10',
  '5/10 (日)',
  '岡山 • 桃園',
  null,
  '[{"time":"12:00","label":"午餐","meals":[{"type":"午餐","name":"おかやま駅弁","dishes":"火車便當"}]},{"time":"13:00","label":"啟程前往機場","mapQ":"搭利木津巴士出發","transport":[{"tool":"利木津巴士","from":"岡山西口","fromQ":"岡山西口","to":"機場","toQ":"機場","duration":"30分","recommended":true}]},{"time":"13:30","label":"抵達機場準備登機","mapQ":"岡山機場"},{"time":"15:55","label":"揮別山陰山陽回程","mapQ":"IT215 起飛 → 台北桃園T1","transport":[{"tool":"飛機","from":"岡山機場","fromQ":"岡山機場","to":"桃園機場 T1","toQ":"台湾桃園国際空港 第1ターミナル","duration":"2時45分","note":"台灣虎航 IT215"}]}]'::jsonb,
  8
);
