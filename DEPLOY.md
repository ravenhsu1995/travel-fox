# 部署指南：Supabase + Vercel + Google OAuth

照下面三段順序做：先 Supabase 後端 → 本機驗證 → 推 Vercel。

---

## Part 1 — Supabase 後端

詳見 [supabase/README.md](./supabase/README.md)。簡單版：

1. https://supabase.com/dashboard 建立新專案，region 選 **Tokyo (ap-northeast-1)**
2. **SQL Editor** 依序跑：
   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_rls.sql`
   - `supabase/migrations/0003_seed_public_sample.sql`
3. **Authentication → Providers**：
   - 啟用 **Email**
   - 啟用 **Google**（見下面 Part 1.5）
4. **Authentication → URL Configuration**：
   - Site URL：`http://localhost:3000`
   - Redirect URLs：`http://localhost:3000/auth/callback`
5. **Settings → API** 拿到：
   - Project URL → 填進 `.env.local` 的 `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → 填進 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Part 1.5 — Google OAuth 設定（一次性，慢但只做一次）

1. 到 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立或選一個專案
3. **APIs & Services → Credentials** → **Create credentials → OAuth client ID**
4. Application type 選 **Web application**
5. **Authorized redirect URIs** 加入：
   - `https://<your-supabase-ref>.supabase.co/auth/v1/callback`
   - （`<your-supabase-ref>` 是你的 Supabase Project URL 中間那串）
6. 建立後拿到 **Client ID** 與 **Client Secret**
7. 回到 Supabase Dashboard → Authentication → Providers → Google：
   - 貼入 Client ID 與 Client Secret，存檔
8. 第一次使用前可能還需要設定 OAuth consent screen（公開或內部測試模式）

---

## Part 2 — 本機驗證

```bash
cd travel-app
npm run dev
```

瀏覽 http://localhost:3000：

- 未登入 → 看到關西公開範例
- 點「登入 / 註冊」→ /login，用 Email 註冊或 Google 登入
- 登入後 → /trips 看到空列表
- 「+ 新增行程」→ 填「韓國首爾 10 天」之類測試
- 進入新建的 trip → 點「✏️ 編輯整個行程」測試完整編輯器
- 進入「💴 記帳」測試新增花費

如果首頁顯示「尚未連上 Supabase」，代表 `.env.local` 還沒填或填錯。

---

## Part 3 — Vercel 部署

### 3.1 推上 GitHub

```bash
cd travel-app
git init
git add .
git commit -m "feat: initial travel app"
gh repo create travel-fox --private --source=. --remote=origin --push
# 或者手動到 github.com 開私有 repo 後 git push
```

`.env.local` 不會被 commit（已在 `.gitignore`）。

### 3.2 連 Vercel

1. https://vercel.com/new → **Import Git Repository** → 選你剛剛的 repo
2. Framework Preset 自動偵測為 **Next.js**
3. **Environment Variables** 加入：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy**

幾秒鐘後拿到 `https://<your-project>.vercel.app`。

### 3.3 把 production URL 加回 Supabase + Google

部署成功後，回頭補設定（不然 OAuth 跳不回來）：

**Supabase Dashboard → Authentication → URL Configuration**：
- Site URL 改成 `https://<your-project>.vercel.app`
- Redirect URLs 加入 `https://<your-project>.vercel.app/auth/callback`

**Google Cloud Console → Credentials → 你的 OAuth client**：
- Authorized redirect URIs 也加入 `https://<your-supabase-ref>.supabase.co/auth/v1/callback`（其實這條一開始就加了，不用動）
- 如果想要 Google OAuth 在 production 用，OAuth consent screen 可能需要從 testing 改成 production

回到 Vercel **不需要** redeploy（這些是 Supabase 端設定）。

---

## 驗證清單

| 項目 | 怎麼測 | 預期 |
|---|---|---|
| 公開範例 | 未登入訪問 / | 看到關西完整行程 |
| Email 登入 | /login 用 Email + 密碼註冊 | 收到驗證信，點連結 → /trips |
| Google 登入 | /login 點 Google | OAuth 跳轉 → /trips |
| 新增 trip | /trips/new 填韓國首爾 10 天 | 列表多一筆 + 自動 10 個空白日 |
| 編輯時間軸 | 隨意 day 點編輯 → 加交通/餐廳/體驗 | 儲存後重整資料還在 |
| 記帳 | /trips/[id]/expenses 加一筆 ¥1500 | 總計顯示 ≈ NT$315 |
| RLS 隔離 | 另一個帳號登入 | 看不到前一帳號的 trip |
| 公開範例隔離 | 任何狀態下 | 公開範例可讀，不能改 |

---

## 常見問題

- **OAuth 跳轉後白頁 / error=callback**：通常是 Redirect URLs 沒設好。檢查 Supabase Auth URL Configuration。
- **首頁顯示「尚未連上 Supabase」**：`.env.local`（或 Vercel env vars）的 URL/key 錯了。
- **新增行程顯示 RLS error**：`0002_rls.sql` 沒跑或跑失敗。回 SQL Editor 重跑。
- **本機沒問題、Vercel 上 OAuth 跳不回來**：production URL 沒加進 Supabase Redirect URLs。
