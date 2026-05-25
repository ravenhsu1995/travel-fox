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
  '入境 → 神戶',
  '{"name":"Hostel Anchorage 神戸","checkin":"16:00","checkout":null,"cost":"¥4,800 / 人 / 晚 · 3晚 · 3位成人","mapQ":"Hostel Anchorage 神戸 元町"}'::jsonb,
  '[{"time":"09:30","label":"搭機啟程","mapQ":"台湾桃園国際空港 第1ターミナル","transport":[{"tool":"飛機","from":"桃園機場 T1","fromQ":"台湾桃園国際空港 第1ターミナル","to":"關西機場 T2","toQ":"関西国際空港 第2ターミナル","duration":"2小時50分","note":"樂桃航空 MM24・之"}]},{"time":"13:20","label":"落地入境","mapQ":"関西国際空港 第2ターミナル","transport":[{"tool":"高速船","from":"關西機場","fromQ":"関西国際空港 第2ターミナル","to":"神戶機場","toQ":"神戸空港 ポートライナー 神戸空港駅","duration":"45–50分鐘","cost":"¥840 / NT$175","note":"Bay Shuttle 高速船・終點為神戶機場海上碼頭，下船後需搭 Port Liner（¥250）至神戶空港站再轉乘地鐵/電車入市區","recommended":true},{"tool":"利木津巴士","from":"關西機場","fromQ":"関西国際空港 第2ターミナル","to":"三宮","toQ":"三ノ宮駅","duration":"65–75分鐘","cost":"¥2,200 / NT$460","note":"直達三宮，行李多時首選"},{"tool":"JR 轉乘","from":"關西機場","fromQ":"関西国際空港 第2ターミナル","to":"三宮","toQ":"三ノ宮駅","duration":"約90分鐘","cost":"¥1,200 / NT$250","note":"需轉乘，行李多時較不便"}]},{"time":"14:30","label":"午餐","meals":[{"type":"午餐","name":"とんかつ七兵衛 三宮店","dishes":"豬排飯"}]},{"time":"15:30","label":"三宮街區初探","mapQ":"三ノ宮駅 神戸市中央区","exps":[{"headline":"異國風情街區漫步","spot":"南京町中華街","cost":"¥500–1,500","desc":"神戶最具代表性的中華街，適合邊走邊吃，感受日本版異國氛圍","mapQ":"南京町 神戸市 中華街"}]},{"time":"16:00","label":"入住安頓","mapQ":"Hostel Anchorage 神戸 元町","isHotelArrival":true},{"time":"20:00","label":"神戶港夜色","mapQ":"メリケンパーク 神戸港","exps":[{"headline":"昭和風立飲居酒屋體驗","spot":"三宮高架下酒場街","cost":"¥1,000–2,000","desc":"融入在地夜晚文化，昭和風情高架下小店，氣氛獨特","mapQ":"三宮高架下 居酒屋 神戸市"},{"headline":"神戶港塔夜景・海濱漫步","spot":"神戶港塔・美利堅公園","cost":"登塔 ¥1,000–1,200（海濱散步免費）","desc":"翻修重開的神戶地標，夜間燈光絕美，美利堅公園海濱散步無需門票","mapQ":"神戸ポートタワー 美利堅公園"},{"headline":"日本最古老神社之一・夜間參拜","spot":"生田神社","cost":"參拜免費・御守 ¥1,000","desc":"三宮夜間開放參拜，縁結び著名古社，氣氛靜謐幽深","mapQ":"生田神社 神戸市"}]},{"time":"21:00","label":"晚餐","meals":[{"type":"晚餐","name":"鶏soba座銀 神戸本店","dishes":"雞白湯/飛魚湯拉麵"}]}]'::jsonb,
  0
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-03',
  '5/3 (日)',
  '神戶海線散策',
  '{"name":"Hostel Anchorage 神戸","checkin":null,"checkout":null,"cost":"¥4,800 / 人 / 晚","mapQ":"Hostel Anchorage 神戸 元町"}'::jsonb,
  '[{"time":"09:00","label":"早餐","meals":[{"type":"早餐","name":"明石玉子焼 中々","dishes":"明石燒"}]},{"time":"10:15","label":"從飯店出發","mapQ":"Hostel Anchorage 神戸 元町","transport":[{"tool":"電車","from":"Hostel Anchorage 神戸","fromQ":"Hostel Anchorage 神戸 元町","to":"舞子地區","toQ":"舞子地區","cost":"¥1,000","note":"山陽電車一日券・全線自由乘坐，機動性最高","recommended":true},{"tool":"JR","from":"Hostel Anchorage 神戸","fromQ":"Hostel Anchorage 神戸 元町","to":"舞子地區","toQ":"舞子地區","cost":"¥1,500","note":"神戶線・各站停靠"},{"tool":"自駕","from":"Hostel Anchorage 神戸","fromQ":"Hostel Anchorage 神戸 元町","to":"舞子地區","toQ":"舞子地區","duration":"各點 15–30分","cost":"每人分攤約 ¥5,000","note":"租車自駕"}]},{"time":"11:00","label":"舞子海濱浪漫漫步","mapQ":"舞子地區","exps":[{"headline":"海濱玫瑰庭園散策","spot":"舞子公園/離宮玫瑰園","cost":"¥340–400","desc":"舞子公園/離宮玫瑰園散策","mapQ":"舞子公園/離宮玫瑰園"},{"headline":"古典復古洋館巡禮","spot":"孫文紀念館","cost":"¥500","desc":"孫文紀念館：洋館建築","mapQ":"孫文紀念館"}]},{"time":"12:30","label":"午餐","meals":[{"type":"午餐","name":"こじゃんと2号店","dishes":"土佐丼"}]},{"time":"13:00","label":"明石海峽巡禮與美食","mapQ":"明石地區","exps":[{"headline":"高空透明海上漫步","spot":"明石海峽大橋","cost":"¥300","desc":"明石海峽大橋散步道：海上透明步道","mapQ":"明石海峽大橋"},{"headline":"熱鬧在地海鮮廚房","spot":"魚之棚邊走邊吃","cost":"¥200–800","desc":"魚之棚邊走邊吃：在地海鮮廚房採買","mapQ":"魚之棚邊走邊吃"},{"headline":"子午線時光地標探訪","spot":"明石市立天文科學館","cost":"¥700","desc":"明石市立天文科學館：標準時子午線地標","mapQ":"明石市立天文科學館"}]},{"time":"15:00","label":"塩屋復古洋館街區","mapQ":"塩屋地區","exps":[{"headline":"昭和懷舊洋館秘境","spot":"塩屋昭和洋館街道","cost":"免費","desc":"塩屋昭和洋館街道漫步","mapQ":"塩屋昭和洋館街道"}]},{"time":"15:30","label":"點心","meals":[{"type":"點心","name":"食ぱんの店 春夏+秋冬 三宮センタープラザ店","dishes":"生甜甜圈＆吐司"}]},{"time":"16:30","label":"須磨海岸療癒時光","mapQ":"須磨地區","exps":[{"headline":"沉浸式療癒海洋世界","spot":"須磨シーワールド","cost":"¥3,100","desc":"須磨シーワールド（水族園）：療癒海洋生物館","mapQ":"須磨シーワールド"}]},{"time":"20:00","label":"晚餐","meals":[{"type":"晚餐","name":"土佐清水ワールド 三宮生けすセンター","dishes":"居酒屋"}]}]'::jsonb,
  1
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-04',
  '5/4 (一)',
  '神戶山線秘境',
  '{"name":"Hostel Anchorage 神戸","checkin":null,"checkout":"10:00","cost":"¥4,800 / 人 / 晚","mapQ":"Hostel Anchorage 神戸 元町"}'::jsonb,
  '[{"time":"09:15","label":"從飯店出發","mapQ":"Hostel Anchorage 神戸 元町","transport":[{"tool":"自駕","from":"Hostel Anchorage 神戸","fromQ":"Hostel Anchorage 神戸 元町","to":"有馬","toQ":"有馬溫泉","duration":"各段 30–40分","cost":"每人分攤約 ¥6,000","note":"租車自駕・神戶 → 有馬→三田→篠山","recommended":true},{"tool":"計程車","from":"Hostel Anchorage 神戸","fromQ":"Hostel Anchorage 神戸 元町","to":"有馬溫泉","toQ":"有馬溫泉","cost":"¥25,000 / NT$5,250","note":"觀光計程車包車"}]},{"time":"10:00","label":"有馬古老溫泉鄉巡禮","mapQ":"有馬溫泉","exps":[{"headline":"百年金之湯暖身洗滌","spot":"有馬溫泉","cost":"¥650","desc":"有馬溫泉日歸浴：金之湯","mapQ":"有馬溫泉"},{"headline":"大人系精緻機械玩偶","spot":"有馬玩具博物館","cost":"¥800","desc":"有馬玩具博物館：大人系機械玩偶","mapQ":"有馬玩具博物館"}]},{"time":"12:00","label":"三田在地農產尋味","mapQ":"三田駅 三田市 兵庫県","exps":[{"headline":"鮮採草莓與手作尋寶","spot":"農產直賣所","cost":"預算自訂","desc":"農產直賣所：在地草莓與手作點心","mapQ":"農產直賣所"}]},{"time":"12:30","label":"午餐","meals":[{"type":"午餐","name":"隣のビリケン","dishes":"山豬肉烏龍麵、和牛丼"}]},{"time":"14:00","label":"丹波篠山古都漫遊","mapQ":"丹波篠山","exps":[{"headline":"傳統丹波燒陶藝手作","spot":"丹波燒手作","cost":"¥1,500–3,500","desc":"丹波燒手作體驗：立杭陶之鄉","mapQ":"丹波燒手作"},{"headline":"老街山產與黑豆甜品","spot":"篠山老街","cost":"¥600–2,000","desc":"篠山老街：烤山豬肉串、黑豆甜點","mapQ":"篠山老街"}]},{"time":"15:30","label":"點心","meals":[{"type":"點心","name":"YAKI-PON","dishes":"烤栗子"}]},{"time":"18:30","label":"神戶港灣璀璨夜色","mapQ":"三ノ宮駅 神戸市中央区"},{"time":"19:30","label":"晚餐","meals":[{"type":"晚餐","name":"焼肉ホルモン まる久商店","dishes":"燒肉"}]}]'::jsonb,
  2
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-05',
  '5/5 (二)',
  '神戶市區 → 鳥取',
  '{"name":"Green Rich Hotel 鳥取駅前","checkin":"15:00","checkout":null,"mapQ":"グリーンリッチホテル鳥取駅前"}'::jsonb,
  '[{"time":"08:30","label":"早餐","meals":[{"type":"早餐","name":"放香堂加琲","dishes":"咖啡、烤吐司"}]},{"time":"09:00","label":"整裝退房出發","mapQ":"Hostel Anchorage 神戸 元町"},{"time":"10:30","label":"神戶市街慢活探索","mapQ":"三ノ宮駅 神戸市中央区","exps":[{"headline":"空中纜車俯瞰神戶港","spot":"布引香草園纜車","cost":"¥2,000","desc":"布引香草園纜車：俯瞰神戶港","mapQ":"布引香草園纜車"},{"headline":"庶民日常復古錢湯","spot":"在地錢湯","cost":"¥450","desc":"在地錢湯體驗：二宮溫泉庶民日常","mapQ":"在地錢湯"},{"headline":"劇場型奇幻水族光影","spot":"átoa 水族館","cost":"¥2,600","desc":"átoa 水族館：劇場型燈光裝置藝術","mapQ":"átoa 水族館"}]},{"time":"11:30","label":"午餐","meals":[{"type":"午餐","name":"神戸牛らーめん 八坐和","dishes":"和牛拉麵"}]},{"time":"15:00","label":"高空纜車香草園巡禮","mapQ":"メリケンパーク 神戸 ハーバーランド","exps":[{"headline":"空中纜車俯瞰神戶港","spot":"布引香草園纜車","cost":"¥2,000","desc":"布引香草園纜車（若上午未去）","mapQ":"布引香草園纜車"}]},{"time":"18:30","label":"鐵道悠閒北上山陰","mapQ":"三ノ宮駅 神戸市","transport":[{"tool":"特急","from":"三宮","fromQ":"三宮","to":"鳥取","toQ":"グリーンリッチホテル鳥取駅前","duration":"2h10m","cost":"¥6,620 / NT$1,390","note":"超級白兔號・三宮 → 鳥取・全車指定席，黃金週務必提前劃位","recommended":true},{"tool":"巴士","from":"神戶港灣區","fromQ":"メリケンパーク 神戸 ハーバーランド","to":"Green Rich Hotel 鳥取駅前","toQ":"グリーンリッチホテル鳥取駅前","duration":"2h50m","cost":"¥3,800 / NT$800","note":"高速巴士"}]},{"time":"21:00","label":"入住安頓","mapQ":"グリーンリッチホテル鳥取駅前","isHotelArrival":true},{"time":"21:30","label":"晚餐","meals":[{"type":"晚餐","name":"やきとり家 すみれ 鳥取店","dishes":"串燒"}]}]'::jsonb,
  3
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-06',
  '5/6 (三)',
  '鳥取砂丘 → 海鮮大餐',
  '{"name":"Green Rich Hotel 鳥取駅前","checkin":null,"checkout":"11:00","mapQ":"グリーンリッチホテル鳥取駅前"}'::jsonb,
  '[{"time":"09:15","label":"從飯店出發","mapQ":"グリーンリッチホテル鳥取駅前","transport":[{"tool":"計程車","from":"Green Rich Hotel 鳥取駅前","fromQ":"グリーンリッチホテル鳥取駅前","to":"鳥取砂丘","toQ":"鳥取砂丘","cost":"¥4,000","note":"觀光計程車包車・3小時點到點接送，名額有限","recommended":true},{"tool":"巴士","from":"Green Rich Hotel 鳥取駅前","fromQ":"グリーンリッチホテル鳥取駅前","to":"鳥取砂丘","toQ":"鳥取砂丘","cost":"¥300","note":"麒麟獅子循環巴士"}]},{"time":"10:00","label":"鳥取壯闊砂丘探秘","mapQ":"鳥取砂丘","exps":[{"headline":"沙漠風情駱駝騎行","spot":"騎駱駝體驗","cost":"¥1,500","desc":"騎駱駝體驗：異國照片拍攝","mapQ":"騎駱駝體驗"},{"headline":"高空吊椅俯瞰砂丘","spot":"砂丘觀景吊椅","cost":"¥400","desc":"砂丘觀景吊椅：高處俯瞰免爬沙","mapQ":"砂丘觀景吊椅"}]},{"time":"10:30","label":"點心","meals":[{"type":"點心","name":"いずみおじさんのソフトクリーム","dishes":"大山冰淇淋"}]},{"time":"11:00","label":"沙雕藝術視覺震撼","mapQ":"砂之美術館","exps":[{"headline":"世界級巨大沙雕展","spot":"砂之美術館","cost":"¥800","desc":"砂之美術館：室內巨大沙雕（常設展）","mapQ":"砂之美術館"}]},{"time":"12:30","label":"午餐","meals":[{"type":"午餐","name":"鳥取砂丘会館門口","dishes":"烤火雞腿"}]},{"time":"13:00","label":"產地直送海鮮巡禮","mapQ":"賀露海鮮市場"},{"time":"18:00","label":"鳥取站前美食夜旅","mapQ":"鳥取車站商圈"},{"time":"18:30","label":"晚餐","meals":[{"type":"晚餐","name":"回転すし北海道 駅南店","dishes":"迴轉壽司"}]}]'::jsonb,
  4
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-07',
  '5/7 (四)',
  '鳥取看海 → 岡山',
  '{"name":"東橫INN 岡山駅西口","checkin":"15:00","checkout":null,"mapQ":"東横イン岡山駅西口"}'::jsonb,
  '[{"time":"09:00","label":"整裝退房出發","mapQ":"グリーンリッチホテル鳥取駅前"},{"time":"10:00","label":"山陰松島海岸絕景","mapQ":"浦富海岸","transport":[{"tool":"巴士","from":"鳥取駅","fromQ":"鳥取駅","to":"浦富","toQ":"浦富","duration":"40分","cost":"¥600 / NT$125","note":"路線公車・鳥取駅 → 浦富","recommended":true},{"tool":"計程車","from":"Green Rich Hotel 鳥取駅前","fromQ":"グリーンリッチホテル鳥取駅前","to":"浦富海岸","toQ":"浦富海岸","duration":"25分","cost":"¥3,500 / NT$735"}],"exps":[{"headline":"海上遊船穿梭奇岩","spot":"浦富海岸遊覽船","cost":"¥1,500","desc":"浦富海岸遊覽船：「山陰松島」海上絕景","mapQ":"浦富海岸遊覽船"}]},{"time":"12:30","label":"鳥取站前惜別午宴","mapQ":"鳥取車站","transport":[{"tool":"特急","from":"鳥取","fromQ":"鳥取","to":"岡山","toQ":"東横イン岡山駅西口","duration":"1h50m","cost":"¥4,490 / NT$945","note":"超級因幡號・鳥取 → 岡山・全車指定席，必須提前劃位","recommended":true}]},{"time":"13:00","label":"午餐","meals":[{"type":"午餐","name":"まつやホルモン店","dishes":"內臟炒麵、關東煮"}]},{"time":"17:00","label":"入住安頓","mapQ":"東横イン岡山駅西口","isHotelArrival":true},{"time":"19:30","label":"晚餐","meals":[{"type":"晚餐","name":"豚ステーキ専門店B イオンモール岡山店","dishes":"烤豬肉定食"}]}]'::jsonb,
  5
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-08',
  '5/8 (五)',
  '岡山 ↔ 倉敷美觀地區',
  '{"name":"東橫INN 岡山駅西口","checkin":null,"checkout":null,"mapQ":"東横イン岡山駅西口"}'::jsonb,
  '[{"time":"10:45","label":"從飯店出發","mapQ":"東横イン岡山駅西口","transport":[{"tool":"JR","from":"東橫INN 岡山駅西口","fromQ":"東横イン岡山駅西口","to":"倉敷","toQ":"倉敷美觀地區","duration":"直達 15分","cost":"¥330 / NT$70","note":"山陽本線・岡山 → 倉敷","recommended":true},{"tool":"計程車","from":"東橫INN 岡山駅西口","fromQ":"東横イン岡山駅西口","to":"倉敷美觀地區","toQ":"倉敷美觀地區","duration":"40分","cost":"¥6,000 / NT$1,260"}]},{"time":"11:30","label":"倉敷白壁水鄉漫遊","mapQ":"倉敷美觀地區","exps":[{"headline":"復古人力車專屬導覽","spot":"倉敷復古人力車","cost":"¥9,000","desc":"倉敷復古人力車：專人拉車導覽代拍","mapQ":"倉敷復古人力車"},{"headline":"運河川舟搖曳水鄉","spot":"倉敷川舟遊船","cost":"¥500","desc":"倉敷川舟遊船：運河微風垂柳（需盡早購票）","mapQ":"倉敷川舟遊船"}]},{"time":"12:30","label":"午餐","meals":[{"type":"午餐","name":"倉敷うどん ぶっかけ ふるいち 仲店","dishes":"烏龍麵"}]},{"time":"14:30","label":"午後文青巷弄尋寶","mapQ":"倉敷運河周邊","exps":[{"headline":"奇趣丹寧藍色小食","spot":"丹寧小吃","cost":"¥400–500","desc":"丹寧小吃：藍色肉包或冰淇淋","mapQ":"丹寧小吃"},{"headline":"西洋殿堂級名作鑑賞","spot":"大原美術館","cost":"¥2,000","desc":"大原美術館：西洋名作","mapQ":"大原美術館"}]},{"time":"17:30","label":"倉敷川夜間浪漫點燈","mapQ":"倉敷美観地区 倉敷川 ライトアップ","transport":[{"tool":"JR","from":"倉敷","fromQ":"倉敷","to":"岡山","toQ":"岡山","duration":"15分","cost":"¥330 / NT$70","note":"返回岡山・倉敷 → 岡山"}]},{"time":"19:00","label":"晚餐","meals":[{"type":"晚餐","name":"和麺ぐり虎 Okayama","dishes":"海老拉麵"}]}]'::jsonb,
  6
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-09',
  '5/9 (六)',
  '岡山農事/庭園 → 宇野溫泉',
  '{"name":"東橫INN 岡山駅西口","checkin":null,"checkout":"10:00","mapQ":"東横イン岡山駅西口"}'::jsonb,
  '[{"time":"09:15","label":"從飯店出發","mapQ":"東横イン岡山駅西口","transport":[{"tool":"巴士","from":"東橫INN 岡山駅西口","fromQ":"東横イン岡山駅西口","to":"岡山市區","toQ":"岡山市區","duration":"西口發車，25分","cost":"¥480 / NT$100","note":"中鐵巴士→農園","recommended":true},{"tool":"路面電車","from":"東橫INN 岡山駅西口","fromQ":"東横イン岡山駅西口","to":"岡山市區","toQ":"岡山市區","duration":"10分","cost":"¥140 / NT$30","note":"→後樂園","recommended":true}]},{"time":"10:00","label":"吉備路農園與名園","mapQ":"岡山市區","exps":[{"headline":"溫室鮮甜草莓採果樂","spot":"農マル園芸吉備路農園","cost":"¥2,200","desc":"農マル園芸吉備路農園：高架溫室採草莓 40分吃到飽","mapQ":"農マル園芸吉備路農園"},{"headline":"日本三大名園靜謐遊","spot":"後樂園與岡山城","cost":"¥640","desc":"後樂園與岡山城：日本三大名園散策","mapQ":"後樂園與岡山城"}]},{"time":"10:30","label":"小午餐","meals":[{"type":"小午餐","name":"日生名物 焼きあなごコーナー","dishes":"鰻魚飯"}]},{"time":"13:00","label":"午餐","meals":[{"type":"午餐","name":"ごはん家 ぼろ小屋","dishes":"刺身定食、牡蠣"}]},{"time":"14:00","label":"鐵道慢旅前往海港","mapQ":"搭 JR 宇野線出發","transport":[{"tool":"JR","from":"岡山","fromQ":"岡山","to":"宇野","toQ":"たまの湯 玉野市 宇野港温泉","duration":"直達 45分","cost":"¥590 / NT$125","note":"宇野線・岡山 → 宇野","recommended":true}]},{"time":"15:00","label":"宇野海景溫泉療癒","mapQ":"たまの湯 玉野市 宇野港温泉","exps":[{"headline":"無邊際海景露天風呂","spot":"瀨戶內溫泉 たまの湯","cost":"¥1,600","desc":"瀨戶內溫泉 たまの湯：無邊際露天風呂海景","mapQ":"瀨戶內溫泉 たまの湯"},{"headline":"海港廢棄物再生藝術","spot":"宇野港再生藝術散步","cost":"免費","desc":"宇野港再生藝術散步：海洋廢棄物裝置藝術","mapQ":"宇野港再生藝術散步"}]},{"time":"19:00","label":"晚餐","meals":[{"type":"晚餐","name":"Mori お好み焼きもり","dishes":"大阪燒"}]}]'::jsonb,
  7
);

insert into days (trip_id, date, day_label, theme, hotel, timeline, sort_order) values (
  '00000000-0000-0000-0000-000000000001',
  '2026-05-10',
  '5/10 (日)',
  '岡山 → 回程',
  null,
  '[{"time":"09:00","label":"滿載賦歸整裝退房","mapQ":"東横イン岡山駅西口"},{"time":"09:30","label":"岡山晨間鮮果饗宴","mapQ":"岡山市區","exps":[{"headline":"頂級時令水果百匯","spot":"頂級水果百匯","cost":"¥2,000–3,500","desc":"頂級水果百匯：水蜜桃/麝香葡萄甜點","mapQ":"頂級水果百匯"},{"headline":"晨間綠道秘境散策","spot":"西川緑道公園","cost":"免費","desc":"西川緑道公園：晨間綠蔭步道","mapQ":"西川緑道公園"}]},{"time":"10:30","label":"在地特產最後巡禮","mapQ":"伴手禮採買","exps":[{"headline":"白桃地酒特產大豐收","spot":"天滿屋/晴之國岡山館","cost":"預算自訂","desc":"天滿屋/晴之國岡山館：白桃甜點、地酒、岡山特產","mapQ":"天滿屋/晴之國岡山館"}]},{"time":"12:00","label":"午餐","meals":[{"type":"午餐","name":"おかやま駅弁","dishes":"火車便當"}]},{"time":"13:00","label":"啟程前往機場","mapQ":"搭利木津巴士出發","transport":[{"tool":"利木津巴士","from":"岡山西口","fromQ":"岡山西口","to":"機場","toQ":"機場","duration":"30分","cost":"¥780 / NT$165","note":"岡山西口 → 機場・無法預約，提前排隊","recommended":true},{"tool":"計程車","from":"伴手禮採買","fromQ":"伴手禮採買","to":"岡山機場","toQ":"岡山機場","duration":"30分","cost":"¥6,500 / NT$1,365"}]},{"time":"13:30","label":"抵達機場準備登機","mapQ":"岡山機場"},{"time":"15:55","label":"揮別山陰山陽回程","mapQ":"IT215 起飛 → 台北桃園T1","transport":[{"tool":"飛機","from":"岡山機場","fromQ":"岡山機場","to":"IT215 起飛 → 台北桃園T1","toQ":"IT215 起飛 → 台北桃園T1","duration":"2時45分","note":"IT215 台灣虎航｜直飛台北・岡山機場 15:55 → 桃園T1 17:40"}]}]'::jsonb,
  8
);
