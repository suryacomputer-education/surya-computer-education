# SURYA COMPUTER OF EDUCATION CENTER — CIMP

Professional clean project package for the public website, AERON assistant, admin UI, and Google Apps Script backend.

## 1. Project architecture

```text
Browser
  ├─ Public/Admin/Student HTML pages
  ├─ assets/css + assets/js
  └─ AERON frontend widget
          │
          ▼
Google Apps Script Web App (google-apps-script/)
  ├─ code.gs          → doGet / doPost API router
  ├─ AERON.gs         → AERON application/router
  ├─ AERONLLM.gs      → Gemini → Sarvam → OpenAI fallback
  └─ domain modules   → Admissions / Students / Results / etc.
          │
          ▼
Google Sheets / configured services
```

## 2. Cleanup performed

- Removed backup/version-snapshot files (`*.before_*`, `.bak`, backup copies).
- Removed the old `3-9-26-1pm.zip` archive from the project package.
- Removed duplicate Google Apps Script `.js` mirrors. Apps Script source is kept as `.gs`; `.claspignore` also excludes `*.js`.
- Kept the original functional `.gs`, HTML, CSS, frontend JS, JSON, image, SVG, and configuration files.
- Removed the inert production include for `AERON/js/aeron.js`; the file remains only for compatibility/reference.
- Added a robust favicon set: ICO + 48/96/180/192/512 PNG sizes + Apple touch icon.
- Increased the AERON browser API timeout to 35 seconds so server-side AI fallback has more time to finish.
- Added one retry for transient Gemini HTTP 429/5xx responses before falling back to the next provider.

## 3. AERON provider flow

`AERON public question → verified/local answer → Gemini → Sarvam AI → OpenAI → deterministic fallback → unavailable message`

Provider API keys are expected in **Google Apps Script Script Properties**, never in browser files.

Recommended Script Properties:
```text
AERON_LLM_ENABLED=true
AERON_LLM_MODEL=gemini-3.6-flash
AERON_GEMINI_API_KEY=<secret>
AERON_SARVAM_API_KEY=<secret>
AERON_SARVAM_MODEL=sarvam-105b
AERON_OPENAI_API_KEY=<secret>
AERON_OPENAI_MODEL=gpt-4.1-mini
```

Do not commit or paste API keys into HTML/JS or GitHub.

## 4. API connection

Current frontend API URL:
`{read('AERON/config/aeron-config.js').split('apiUrl: )[1].split(')[0]}`

Public AERON questions use GET `action=aeronAsk`. Other operations use POST. Protected admin endpoints still require server-side session validation.

## 5. Favicon / Google Search

The homepage declares the favicon files below. The favicon can display in browsers immediately after deployment, while Google Search may keep a cached icon until Google recrawls and refreshes the result.

`assets/images/favicon.ico`
`assets/images/favicon-48.png`
`assets/images/favicon-96.png`
`assets/images/favicon-192.png`
`assets/images/apple-touch-icon.png`

Google Search favicon changes cannot be forced from the website code alone; Search Console URL inspection/request-indexing can request a fresh crawl.

## 6. Deployment

### Frontend / GitHub Pages
Push the project root to the configured GitHub repository and ensure GitHub Pages publishes the intended branch/folder.

### Apps Script
From `google-apps-script/`:
```bash
clasp push
```
Update an existing web-app deployment rather than creating unnecessary new deployment IDs when the project already has a stable endpoint.

## 7. File map

- `DEPLOYMENT_CHECK.md` — Project documentation / configuration file.
- `FINAL_AERON_FIX_NOTES.md` — Project documentation / configuration file.
- `PROJECT_FILE_MAP_2026-08-26.md` — Project documentation / configuration file.
- `README_AERON.md` — Project documentation / configuration file.
- `README_CIMP_FINAL.md` — Project documentation / configuration file.
- `README_CLEAN_FINAL_2026-08-26.md` — Project documentation / configuration file.
- `README_CLEAN_PROJECT.md` — Project documentation / configuration file.
- `REDMAP_2026-08-26_1450.md` — Project documentation / configuration file.
- `REDMAP_GOOGLE_SHEETS_FINAL.md` — Project documentation / configuration file.
- `about.html` — Institute/about information page.
- `admin-admissions.html` — Admin admission/application management.
- `admin-certificates.html` — Admin certificate management.
- `admin-contact-messages.html` — Admin contact-message management.
- `admin-courses.html` — Admin course management.
- `admin-emergency.html` — Admin emergency/security controls.
- `admin-live-classes.html` — Admin live-class management.
- `admin-login.html` — Admin authentication and login UI.
- `admin-media.html` — Admin media/asset management.
- `admin-mock-tests.html` — Admin mock-test management.
- `admin-notices.html` — Admin notice management.
- `admin-results.html` — Admin result management.
- `admin-student-access.html` — Admin student-access/session assistance.
- `admin-students.html` — Admin student management.
- `admin.html` — Admin dashboard entry/overview.
- `admission-success.html` — Post-admission success/confirmation page.
- `admission.html` — Public admission/application form and submission UI.
- `certificate-print.html` — Printable certificate/result view and supporting data loading.
- `certificate-verification.html` — Certificate verification interface for visitors.
- `certificate.html` — Public certificate lookup/display UI.
- `contact.html` — Public contact page and contact form.
- `courses.html` — Public course catalogue and course information UI.
- `faq.html` — Frequently asked questions page.
- `gallery.html` — Institute image gallery.
- `google2356b7a67d920cb7.html` — Google Search Console HTML ownership-verification file.
- `index.html` — Public homepage; SEO metadata, favicon declarations, institute hero/content, and AERON widget.
- `live-classes.html` — Public live class listing/view.
- `mock-test.html` — Public mock-test interface.
- `notice.html` — Public notice listing/view.
- `result.html` — Public result lookup and result display UI.
- `sitemap.xml` — Search-engine sitemap for public site URLs.
- `student-dashboard.html` — Authenticated student dashboard.
- `student-login.html` — Student login/session entry page.

### AERON

- `AERON/LLM_SETUP.md` — AI provider setup notes.
- `AERON/README.md` — AERON architecture/usage notes.
- `AERON/TTS_FOUNDATION.md` — Text-to-speech foundation notes.
- `AERON/assets/icon/aeron.svg` — AERON launcher/assistant icon.
- `AERON/brain/intents.json` — Keyword/intention definitions for local routing.
- `AERON/brain/knowledge.json` — Verified institute facts and AERON local capabilities.
- `AERON/brain/rules.json` — Local answer/routing rules.
- `AERON/config/aeron-config.js` — Frontend AERON configuration; points to server API and feature flags.
- `AERON/css/aeron.css` — Scoped AERON widget styling.
- `AERON/index.html` — Standalone AERON test page.
- `AERON/js/aeron-tts.js` — TTS provider adapter/foundation.
- `AERON/js/aeron-widget.js` — Main AERON chat widget, keyboard, voice, local fallback, and API client.
- `AERON/js/aeron.js` — Legacy compatibility entry point; not loaded by production homepage.

### Google Apps Script backend

- `google-apps-script/.clasp.json` — clasp project binding for Apps Script.
- `google-apps-script/.claspignore` — Excludes browser .js mirrors from Apps Script deployment.
- `google-apps-script/AERON.gs` — AERON public/admin routing, verified answers, help, and assistant logic.
- `google-apps-script/AERONLLM.gs` — Server-side Gemini/Sarvam/OpenAI provider adapters and LLM fallback router.
- `google-apps-script/AERONMemory.gs` — Backend opt-in AERON memory storage.
- `google-apps-script/AERONNotifications.gs` — AERON notification recording/notification helpers.
- `google-apps-script/Auth.gs` — Admin authentication/session/security functions.
- `google-apps-script/Certificates.gs` — Certificate data operations and public certificate access.
- `google-apps-script/CourseSubjects.gs` — Course-subject relationship management.
- `google-apps-script/Courses.gs` — Course management and public course data.
- `google-apps-script/LiveClasses.gs` — Live-class management and public live-class data.
- `google-apps-script/Media.gs` — Media management/storage helpers.
- `google-apps-script/MockTests.gs` — Mock-test management and data operations.
- `google-apps-script/Notices.gs` — Notice management and public notices.
- `google-apps-script/ResultSubjects.gs` — Result-subject management and public subject data.
- `google-apps-script/Results.gs` — Result management and public result operations.
- `google-apps-script/SetupSheets.gs` — Spreadsheet/sheet initialization and setup utilities.
- `google-apps-script/StudentAuth.gs` — Student authentication/session functions.
- `google-apps-script/Students.gs` — Student data management and lookup functions.
- `google-apps-script/admission.gs` — Admission form handling and application data operations.
- `google-apps-script/appsscript.json` — Apps Script runtime, timezone, and web-app deployment settings.
- `google-apps-script/code.gs` — Central GET/POST API router (`doGet`/`doPost`).
- `google-apps-script/document.gs` — Document/file related backend helpers.
- `google-apps-script/helpers.gs` — Shared backend utility functions.

### Frontend JavaScript

- `assets/js/aadhaar-manager.js` — Aadhaar/photo upload and client-side handling helpers.
- `assets/js/admin-admissions.js` — Admin admissions data retrieval, filters, status/actions, and UI.
- `assets/js/admin-certificates.js` — Admin certificate management logic.
- `assets/js/admin-guard.js` — Admin-page authentication/session guard.
- `assets/js/admin-results-1.js` — Admin result management UI/data helpers (part 1).
- `assets/js/admin-results-2.js` — Admin result management API/UI logic (part 2).
- `assets/js/admin.js` — Shared admin dashboard/UI helpers.
- `assets/js/admission.js` — Admission form client-side validation/submission flow.
- `assets/js/data-manager.js` — Shared client data/API management helpers.
- `assets/js/data-migration.js` — Legacy/client data migration utilities.
- `assets/js/main.js` — Shared public-site JavaScript.
- `assets/js/mobile-ui.js` — Mobile UI behavior helpers.
- `assets/js/project-ui.js` — Shared project UI, theme, reading-mode, and interface helpers.
- `assets/js/student-aadhaar-upload.js` — Student Aadhaar upload UI/flow.
- `assets/js/student-marcsheet-upload.js` — Student marksheet upload UI/flow.
- `assets/js/student-marcsheet.js` — Student marksheet retrieval/display helpers.
- `assets/js/student-photo.js` — Student photo handling/display helpers.
- `assets/js/student-signature-upload.js` — Student signature upload flow.
- `assets/js/student-signature.js` — Student signature retrieval/display helpers.

### Frontend CSS

- `assets/css/dark-mode-fix.css` — Dark-mode compatibility/fixes.
- `assets/css/project-ui.css` — Shared project UI components/utilities.
- `assets/css/responsive.css` — Responsive/mobile layout rules.
- `assets/css/style.css` — Primary site-wide visual styling.

### Images / graphics

- `assets/images/Marcsheet-placeholder.svg` — Image/graphic asset.
- `assets/images/apple-touch-icon.png` — 180×180 Apple touch icon.
- `assets/images/digital-india-msme-oces.png` — Image/graphic asset.
- `assets/images/director.jpg` — Image/graphic asset.
- `assets/images/favicon-180.png` — 180×180 Apple touch icon source.
- `assets/images/favicon-192.png` — 192×192 app icon.
- `assets/images/favicon-48.png` — 48×48 browser/search favicon.
- `assets/images/favicon-512.png` — 512×512 high-resolution app/search icon.
- `assets/images/favicon-96.png` — 96×96 browser/search favicon.
- `assets/images/favicon.ico` — Multi-size ICO favicon for broad browser compatibility.
- `assets/images/favicon.png` — Square source favicon artwork.
- `assets/images/gallery1.jpg` — Image/graphic asset.
- `assets/images/gallery2.jpg` — Image/graphic asset.
- `assets/images/gallery3.jpg` — Image/graphic asset.
- `assets/images/gallery4.jpg` — Image/graphic asset.
- `assets/images/gallery5.jpg` — Image/graphic asset.
- `assets/images/gallery6.jpg` — Image/graphic asset.
- `assets/images/hero.jpg` — Image/graphic asset.
- `assets/images/hero1.jpg` — Image/graphic asset.
- `assets/images/imejeg2/IMG-20260822-WA0000.jpg` — Institute gallery/carousel image.
- `assets/images/imejeg2/IMG-20260822-WA0001.jpg` — Institute gallery/carousel image.
- `assets/images/imejeg2/IMG-20260822-WA0002.jpg` — Institute gallery/carousel image.
- `assets/images/imejeg2/IMG-20260822-WA0003.jpg` — Institute gallery/carousel image.
- `assets/images/imejeg2/IMG-20260822-WA0006.jpg` — Institute gallery/carousel image.
- `assets/images/iso-logo.png` — Image/graphic asset.
- `assets/images/logo.png` — Primary institute header logo used by the website.
- `assets/images/logo2.png` — Alternate/source institute logo artwork.
- `assets/images/signature-placeholder.svg` — Image/graphic asset.
- `assets/images/student-placeholder.svg` — Image/graphic asset.
- `assets/images/favicon-48.png` — 48×48 browser/search favicon.
- `assets/images/favicon-96.png` — 96×96 browser/search favicon.
- `assets/images/favicon-180.png` — 180×180 Apple touch icon source.
- `assets/images/favicon-192.png` — 192×192 app icon.
- `assets/images/favicon-512.png` — 512×512 high-resolution app/search icon.
- `assets/images/apple-touch-icon.png` — 180×180 Apple touch icon.
- `assets/images/favicon.ico` — Multi-size ICO favicon for broad browser compatibility.

## 8. Validation completed

- All project JSON files parsed successfully.
- All frontend `.js` files passed `node --check`.
- All Apps Script `.gs` files passed syntax validation after temporary `.js` conversion for the check.
- Local HTML `script`, `link`, `img`, and `a` references were checked; no broken local references were found in the cleaned package.
- No duplicate global function names were found across the retained `.gs` backend source files.
- No API provider secret pattern was found in the cleaned source package.

## 9. Important operational notes

- Keep `google-apps-script/.claspignore` in place so accidental `.js` mirrors are not pushed to Apps Script.
- A provider label in the AERON reply indicates which server-side provider answered (`Gemini`, `Sarvam AI`, or `OpenAI`).
- Provider fallback is expected behavior; intermittent Gemini availability can therefore result in a Sarvam/OpenAI label rather than an error.
- The frontend timeout is 35 seconds to accommodate server-side fallback.
- The AERON TTS file is a foundation adapter; it does not embed a neural voice model.

## 10. Clean-package policy

This package intentionally contains **source of truth files only** for the deployable project. Historical backups and duplicated source snapshots are excluded from the clean package.