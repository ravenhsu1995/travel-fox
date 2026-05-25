# Supabase 設定步驟

這個資料夾放的是 schema migration 和公開範例 seed。實際執行需要在 Supabase Dashboard 操作。

## 一次性設定

### 1. 建立 Supabase 專案
1. 前往 https://supabase.com/dashboard
2. **New project**
3. **Region 選 Tokyo (ap-northeast-1)** — 給日本旅遊資料最低延遲
4. 設一個資料庫密碼（之後不太會用到，記得存起來備用）

### 2. 跑 migration（SQL Editor）
依序把下列檔案的內容貼到 SQL Editor 執行：

1. `migrations/0001_schema.sql` — 建立 `trips` / `days` / `expenses` 三張表 + 索引
2. `migrations/0002_rls.sql` — 啟用 RLS 與 policies
3. `migrations/0003_seed_public_sample.sql` — 灌入 2026 關西行作為公開範例

> `0003_seed_public_sample.sql` 是用 `scripts/extract-kansai-seed.mjs` 從原始 HTML 自動抽出的。要重新產生：`node scripts/extract-kansai-seed.mjs`。

### 3. 開啟 Auth Providers
在 **Authentication → Providers**：
- ✅ 啟用 **Email**（內建）
- ✅ 啟用 **Google**
  - 需要先在 [Google Cloud Console](https://console.cloud.google.com/) 建立 OAuth 2.0 Client ID（Web application）
  - Authorized redirect URI 填：`https://<your-project-ref>.supabase.co/auth/v1/callback`
  - 把拿到的 Client ID 與 Client Secret 填回 Supabase

### 4. 設定 Auth URLs
**Authentication → URL Configuration**：
- **Site URL**：`http://localhost:3000`（開發階段）
- **Redirect URLs**：加入 `http://localhost:3000/auth/callback`
- 部署到 Vercel 後再回來補上 production URL

### 5. 取得 API 金鑰 → 填進 .env.local
**Settings → API**：
- 複製 `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- 複製 `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

把這兩個值寫進專案根目錄的 `.env.local`。

### 6. 驗證
回到專案，重啟 dev server，公開首頁應該能載入到關西公開範例 trip（Stage 4 程式碼會做這件事）。

```bash
curl -s "$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d= -f2)/rest/v1/trips?is_public_sample=eq.true&select=*" \
  -H "apikey: $(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2)" | head -5
```

如果回傳 1 筆 `2026 關西行`，就成功了。

## 注意事項

- **anon key 可以放 Git / 前端 bundle**，所有資料保護靠 RLS
- **service_role key 絕不要放任何地方**（這個專案不需要用到）
- 重新跑 `0003_seed_public_sample.sql` 是 idempotent 的（會先 delete 舊資料再 insert）
