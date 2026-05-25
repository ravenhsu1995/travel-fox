# 旅行狐狸

個人旅遊行程記事與記帳 App。
未登入可看公開範例（2026 關西行），登入後可建立、編輯多個自己的行程。

## 技術棧

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4**
- **Supabase**：Auth (Google + Email) + Postgres + RLS
- **react-leaflet** 地圖
- 部署：**Vercel**

## 本機開發

```bash
npm install
cp .env.example .env.local
# 填入 .env.local（從 Supabase Dashboard Settings → API 取得）
npm run dev
```

開 http://localhost:3000

## 部署

見 [DEPLOY.md](./DEPLOY.md) — 從 Supabase 後端到 Vercel + Google OAuth 全流程。

## 目錄結構

```
app/                       # Next.js App Router 路由
├── page.tsx               # 首頁（公開範例 trip）
├── login/                 # Email/Google 登入
├── auth/{callback,signout} # 認證 API
└── trips/                 # 個人 trip CRUD
    ├── page.tsx           # 我的行程列表
    ├── new/               # 新增 trip 精靈
    └── [tripId]/
        ├── page.tsx       # 檢視 trip
        ├── edit/          # 完整編輯器（含巢狀時間軸）
        └── expenses/      # 個人記帳

components/
├── trip/                  # Trip 檢視元件
├── trip/editor/           # Trip 編輯器
├── expense/               # 記帳元件
└── map/                   # Leaflet 地圖

lib/
├── supabase/              # Browser / Server / Proxy clients
├── types.ts               # TypeScript 型別
├── currency.ts            # 多幣別換算
└── maps.ts                # Google Maps URL builder

supabase/migrations/       # Schema / RLS / Seed SQL
scripts/extract-kansai-seed.mjs  # 從原 HTML 抽出 DAYS 轉 SQL

proxy.ts                   # Session refresh + 路由保護（Next 16 取代了 middleware）
```

## 從 2026關西行程.html 移植了什麼

| 來源 | 去向 |
|---|---|
| CSS 設計變數 | `app/globals.css` `@theme` |
| `DAYS` 陣列 | seed 進 DB 作為公開範例 trip |
| Timeline 渲染 | `components/trip/TimelineItemView.tsx` |
| 多幣別換算 | `lib/currency.ts`（擴充支援多國幣別） |

**廢棄**：分帳邏輯（`calculateDebts`、`bulkSettleWith`、還款記錄）— 改為純個人記帳。

## 重新產生公開範例 seed

如果改了原 HTML 的 DAYS：

```bash
node scripts/extract-kansai-seed.mjs
# 然後回 Supabase SQL Editor 跑 0003_seed_public_sample.sql
```
