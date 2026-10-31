# Project memory

## Product intent & audience

- **BarOps** — mobile-first app for bar/kitchen operations management.
- Core features: shift checklists, personal staff tasks, service requests (breakages, purchases), inventory warehouse with Excel export, points & staff settings.
- Target users: bar/kitchen managers and staff (admin role sees all sections incl. Settings).
- Demo-first approach with in-browser storage and reset-to-default capability.

## Brand personality & voice

- Practical, operational, concise.
- Russian-language UI and responses.
- Tone: helpful and direct; invites user feedback on styling ("if 'skin' meant different style/colors, tell me").

## Visual design & UX direction

- Dark theme: coal/charcoal tones with amber-gold accents.
- Rounded cards, large tap-friendly buttons.
- Mobile-first layout.
- Quick demo login buttons on login screen (role selection: Administrator, etc.).
- Role switcher icon in top bar for on-the-fly role changes.
- Settings section includes "Reset demo" button.
- Accessible via StackBlitz preview pane.

## Decisions, constraints & rationale

- Data persisted in browser storage (not backend) — simple for demo, requires reset option.
- Demo credentials hardcoded: venue code **BAR777**, login **admin**, password **123**.
- Role-based access: Administrator unlocks all sections including Settings.
- Framework: Vite 8 + React; esbuild 0.28 (upgraded from 0.25 to resolve peer-dep conflict with Vite 8).
- Build uses standard `npm install` (no `--legacy-peer-deps` needed after esbuild align).
- Demo data initialized in `src/store/initialData.ts`: venue «Мята Lounge» (code BAR777), 2 outlets, staff per role, checklists, tasks, requests, warehouse products.
- Project hosted/run via StackBlitz.

## Open questions & assumptions

- User's term "кожа" interpreted as UI skin/theme — may need clarification if they meant something else.
- No explicit `.bolt/prompt` instructions exist yet.
- Backend / real persistence not in scope (assumed demo-only).
- Multi-language beyond Russian not yet addressed.
- Exact color hex values, typography, and spacing scale not yet specified.