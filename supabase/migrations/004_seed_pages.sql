-- 004_seed_pages.sql
-- Seed default pages with placeholder content

INSERT INTO pages (slug, title, content) VALUES
(
  'about',
  '關於我們',
  '<h2>台北市台灣語協會</h2>
<p>台北市台灣語協會致力於推廣與保存台灣本土語言文化，透過多元化的教育活動與社區推廣，讓更多人認識並使用台灣語。</p>
<h3>我們的宗旨</h3>
<ul>
  <li>推廣台灣語言的學習與使用</li>
  <li>保存台灣語言文化資產</li>
  <li>舉辦語言教育相關活動</li>
  <li>促進本土語言的傳承與發展</li>
</ul>
<h3>聯絡資訊</h3>
<p>歡迎與我們聯繫，共同為台灣語言文化的推廣努力。</p>'
),
(
  'contact',
  '聯絡我們',
  '<h2>聯絡我們</h2>
<p>如有任何問題或合作洽詢，歡迎透過以下方式與我們聯繫：</p>
<h3>聯絡方式</h3>
<ul>
  <li>電子信箱：info@taipei-taiwanese.org.tw</li>
  <li>電話：(02) 1234-5678</li>
  <li>地址：台北市中正區某某路100號</li>
</ul>
<h3>服務時間</h3>
<p>週一至週五 09:00 - 17:00</p>
<p>歡迎來信或來電，我們將盡快回覆您的訊息。</p>'
)
ON CONFLICT (slug) DO NOTHING;
