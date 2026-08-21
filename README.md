# REAM 🎬

**AI-Powered Short-Form Video (Reel) Generation Platform**

REAM turns a simple creative brief — a title, target audience, duration, tone, and keywords — into a fully rendered vertical video. An agentic AI pipeline writes the script, storyboards it frame-by-frame, generates voiceovers and visuals, picks background music, and renders the final reel server-side with [Remotion](https://www.remotion.dev/) — all managed through a role-based web dashboard.

---

## ✨ Features

### AI Generation Pipeline
- **Script Agent** — Google Gemini writes a retention-optimized script (hook → body → ending) plus a complete frame-by-frame storyboard: narration, visual description, image prompt, camera shot, camera movement, and transition for each frame.
- **Generate–Review Loop** — every generated script is automatically reviewed and scored by an AI reviewer; low-scoring outputs are regenerated with feedback until they pass (with retry limits).
- **Voice Agent** — [Sarvam AI](https://www.sarvam.ai/) `bulbul:v3` text-to-speech with 40+ Indian voice speakers (`en-IN`), per-frame audio duration detection via `music-metadata`.
- **Image Agent** — Gemini image generation (`gemini-2.5-flash-image-preview`) with automatic fallback to stock-photo search (Pexels → Pixabay → Unsplash).
- **Music Agent** — Gemini suggests a background-music style, then a royalty-free track is sourced (Pixabay audio) and attached to the reel.
- **Render Agent** — Remotion composition is bundled and rendered on the server with per-frame camera movements (Push In, Pan, Dolly…) and transitions (Fade, Dissolve, Zoom, Whip Pan…), then the final video + thumbnail are uploaded to ImageKit.

### Platform
- **Role-based dashboards** — `ADMIN` (platform analytics, client management) and `CLIENT` (reel studio).
- **Reel studio** — create reels, review/edit scripts and frames, regenerate individual frames (voice/image), regenerate background music, upload your own assets, and render the final video.
- **Authentication** — NextAuth.js v4 with Credentials (bcrypt-hashed passwords) and Google OAuth, JWT sessions, email OTP verification, and forgot/reset password flows via SMTP.
- **Media CDN** — all generated/uploaded assets (images, audio, videos) are stored and served from ImageKit.
- **Theming** — light/dark mode via `next-themes`, built with shadcn/ui + Tailwind CSS v4.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) · React 19 · TypeScript |
| UI | Tailwind CSS v4 · shadcn/ui (Base UI) · lucide-react · next-themes |
| Database | PostgreSQL · [Prisma 7](https://www.prisma.io/) (`@prisma/adapter-pg`) |
| Auth | [NextAuth v4](https://next-auth.js.org/) · Google OAuth · bcrypt · Nodemailer (OTP) |
| AI | [Google Gemini](https://ai.google.dev/) (`@google/genai`) · [Sarvam AI TTS](https://docs.sarvam.ai/) |
| Stock assets | Pexels · Pixabay · Unsplash · Jamendo · Freesound |
| Video rendering | [Remotion 4](https://www.remotion.dev/) (`@remotion/bundler` + `@remotion/renderer`) |
| Media storage | [ImageKit](https://imagekit.io/) |
| Testing | Playwright (E2E) · k6 (load testing) |

---

## 🔄 How It Works

The reel lifecycle is tracked by a `ReelStatus` state machine:

```
DRAFT
  └─> SCRIPT_GENERATED ─> REVIEWING ─> REVIEWED
        └─> STORYBOARD_GENERATED
              └─> IMAGES_GENERATING ─> VOICES_GENERATING
                    └─> VIDEOS_GENERATING ─> RENDERING ─> COMPLETED
                                  └──────── any failure ─> FAILED
```

1. **Create a reel** — the client provides title, audience, duration, tone, keywords, and a preferred voice speaker.
2. **Generate script** — Gemini produces the script + frame plan + music style; an AI reviewer scores it and requests regeneration until it's approved.
3. **Generate assets** — for each frame, in order: Sarvam AI voiceover → Gemini/stock image; frame timings are recalculated from actual audio durations.
4. **Background music** — a style-matched royalty-free track is fetched and uploaded.
5. **Render** — Remotion bundles the composition, renders each frame sequence with narration audio, camera motion and transitions, mixes background music, and uploads the final MP4 + thumbnail to ImageKit.
6. **Deliver** — the client plays/downloads the finished reel from the dashboard.

---

## 📁 Project Structure

```
ream/
├── app/
│   ├── page.tsx                  # Marketing landing page
│   ├── auth/                     # Sign in / sign up / forgot password
│   ├── admin/                    # Admin area (dashboard, client management)
│   ├── client/dashboard/         # Client area (reel list + reel studio)
│   ├── api/
│   │   ├── auth/                 # NextAuth, signup, OTP, password reset
│   │   ├── admin/                # Analytics, client management
│   │   └── client/               # Reels, frames, script, assets, uploads, render
│   ├── lib/                      # Core domain logic
│   │   ├── generate-script.ts    # Gemini script + generate/review workflow
│   │   ├── generate-assets.ts    # Per-frame voice + image agent orchestration
│   │   ├── generate-frame-audio.ts / generate-frame-image.ts
│   │   ├── generate-bg-music.ts  # Background music agent
│   │   ├── generate-video.ts     # Remotion bundling + rendering
│   │   ├── gemini.ts / image-search.ts / music-search.ts
│   │   └── imagekit.ts / mail.ts / prisma.ts / check-role.ts
│   └── hooks/                    # Client hooks (useReel, regenerate flows)
├── components/                   # UI components (shadcn/ui based)
│   ├── ui/                       # Primitives (button, card, dialog, …)
│   ├── admin/ · auth/ · home/
│   └── reel-frames-list.tsx · render-reel-button.tsx · …
├── remotion/                     # Video compositions
│   ├── Root.tsx                  # Remotion root + composition registration
│   ├── ReelComposition.tsx       # Timeline, transitions, bg music
│   └── FrameScene.tsx            # Per-frame visuals + camera movement
├── prisma/
│   └── schema.prisma             # Reel, ReelFrame, FrameVoice/Image/Video, User, Role, Client
├── lib/                          # Shared utils (cn helper)
├── tests/
│   ├── playwright/               # E2E tests (login, reel CRUD, form submission)
│   └── k6/                       # Load tests (sustained API traffic)
├── proxy.ts                      # NextAuth middleware — role-based route guards
└── playwright.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 20+**
- **PostgreSQL** database
- **Remotion rendering** downloads a headless Chrome build automatically on first render (see [Remotion requirements](https://www.remotion.dev/docs/chromium-flags)).

### 1. Install dependencies

```bash
npm install
```

> `postinstall` automatically runs `prisma generate`.

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# ── App ─────────────────────────────────────────────
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# ── Database (PostgreSQL) ───────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/ream

# ── NextAuth ────────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# ── Google Gemini (script / storyboard / images) ────
GEMINI_API_KEY_1=...
GEMINI_API_KEY_2=...
# (multiple keys supported: GEMINI_API_KEY_1 … GEMINI_API_KEY_9)

# ── Sarvam AI (voiceover TTS) ───────────────────────
SARVAM_API_KEY=your-sarvam-api-key

# ── ImageKit (media storage / CDN) ──────────────────
IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id
IMAGEKIT_FOLDER=/ream

# ── Stock asset search (image + music fallbacks) ────
PEXELS_API_KEY=...
PIXABAY_API_KEY=...
UNSPLASH_API_ACCESS_KEY=...
UNSPLASH_API_SECRET_KEY=...
JAMENDO_CLIENT_ID=...
FREESOUND_API_KEY=...

# ── SMTP (OTP + password-reset emails) ──────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="REAM <your-email@gmail.com>"
```

### 3. Set up the database

```bash
npx prisma migrate dev
```

> ⚠️ The `Role` table must contain at least `CLIENT` and `ADMIN` rows — new signups are assigned the `CLIENT` role.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run ngrok` | Expose port 3000 via ngrok (for testing `NEXT_PUBLIC_SERVER_URL` callbacks) |

---

## 👥 Roles & Access

| Role | Capabilities |
|---|---|
| **CLIENT** | Sign up (email/password or Google), create reels, generate/review scripts, generate & regenerate frame assets, upload custom assets, render and download reels |
| **ADMIN** | View platform analytics (clients, reels, success rate, status breakdown), manage clients |

- Route protection is enforced by the NextAuth middleware in `proxy.ts` (`/admin/**` → ADMIN, `/client/**` → CLIENT).
- Every API route independently verifies the session role via `checkUserRole()`.

---

## 🔌 API Overview

All client APIs are authenticated and role-guarded.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/signup` · `/api/auth/verify-otp` | POST | Register + OTP verification |
| `/api/auth/forgot-password` · `/api/auth/reset-password` | POST | Password recovery |
| `/api/auth/[...nextauth]` | * | NextAuth (Credentials + Google) |
| `/api/client/reels` | GET/POST | List / create reels |
| `/api/client/reels/[reelId]` | GET/PATCH/DELETE | Reel detail / update / delete |
| `/api/client/reels/[reelId]/generate-script` | POST | Gemini script + storyboard generation |
| `/api/client/reels/[reelId]/generate-assets` | POST | Voice + image generation for all frames |
| `/api/client/reels/[reelId]/generate-bg-music` | POST | Background music generation |
| `/api/client/reels/[reelId]/render` | POST | Server-side Remotion render |
| `/api/client/reels/[reelId]/frames/[frameId]/regenerate` | POST | Regenerate a single frame |
| `/api/client/script/primary` · `/frame` · `/review` | POST | Script agents (write / frame plan / review) |
| `/api/client/assets/voice` · `/image` · `/bg-music` | POST | Individual asset agents |
| `/api/client/upload/voice` · `/image` · `/video` · `/bg-sound` | POST | Upload assets to ImageKit |
| `/api/admin/analytics` | GET | Platform metrics |
| `/api/admin/clients` · `/api/admin/clients/[clientId]` | * | Client management |

---

## 🧪 Testing

### Playwright (E2E)

```bash
npx playwright install        # one-time browser setup
npx playwright test           # run tests from tests/playwright/
npx playwright show-report    # view HTML report
```

Covers login, reel creation/deletion, and form submissions across Chromium, Firefox, and WebKit.

### k6 (Load testing)

```bash
k6 run tests/k6/test-a-sustained.ts
```

Simulates sustained authenticated API traffic (10 VUs × 10 min) with p95 latency and error-rate thresholds. Uses `NEXT_PUBLIC_SERVER_URL`, `USER_EMAIL`, and `USER_PASSWORD` from the environment.

---

## 📦 Deployment Notes

- **Rendering is Node.js-only** — Remotion's bundler/renderer are marked as `serverExternalPackages` in `next.config.ts`; deploy to a Node runtime (not Edge). Rendering is CPU-heavy, so size the host accordingly.
- Set `NEXT_PUBLIC_SERVER_URL` to the public deployment URL — internal agents call back into the app's own API routes.
- Ensure the ImageKit remote pattern (`ik.imagekit.io`) in `next.config.ts` matches your CDN endpoint.

---

## 📄 License

Private project — all rights reserved.


