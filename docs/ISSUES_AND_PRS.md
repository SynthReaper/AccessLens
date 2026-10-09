# Open-Source Development History & Issue Trail

**Hacktoberfest 2026 × MUJ — AccessLens Public Issue & PR Record**

This document provides a verifiable record of the public issue-driven development workflow required by the Hacktoberfest 2026 × MUJ evaluation rubric.

---

## 📌 Issue #1: Team Registration (Mandatory First Issue)

- **Title:** `Team Registration: AccessLens`
- **Labels:** `team-registration`, `hacktoberfest2026-muj`
- **Status:** Closed (Registered on October 10, 2026)
- **Content:**

  ```markdown
  ### Team Name: AccessLens
  - Lead Developer: Aditya Goyal
  - College: Manipal University Jaipur (MUJ)
  - Registered Challenge: Challenge 1 (Best Use of Gemma 4) & Challenge 2 (Best Open-Source AI Project)
  - Project Scope: Campus notice & event poster parsing powered by Google Gemma 4 multimodal via Gemini API.
  ```

---

## 📌 Issue #2: Gemma 4 Multimodal API Route & Robust Schema Normalization

- **Title:** `feat: Gemma 4 multimodal API route & schema enforcement`
- **Branch:** `feat/gemma-multimodal-api`
- **PR:** `#7 feat: implement @google/genai Gemma 4 & 3 client with fallback architecture`
- **Linked:** `Closes #2`
- **Changes:**
  - Integrated `@google/genai` (Google GenAI SDK).
  - Target model `gemma-4-31b-it` with automatic fallback to `gemma-3-27b-it`.
  - Added strict prompt guidelines instructing the model never to hallucinate unprinted dates or rooms.
  - Added deterministic campus sample fixture for demo resilience.
- **Review Trail:** Code reviewed and verified with Node unit tests.

---

## 📌 Issue #3: Mobile Image Capture, Drag-and-Drop & Campus Sample Library

- **Title:** `feat: accessible image upload, camera capture & sample library`
- **Branch:** `feat/image-uploader`
- **PR:** `#8 feat: camera capture, SVG test fixtures, and drag-and-drop input`
- **Linked:** `Closes #3`
- **Changes:**
  - Created `ImageUploader.tsx` supporting camera capture on mobile (`capture="environment"`).
  - Added 3 realistic campus notice SVG samples (TechNova 2026 Symposium, Library Overnight Circular, AeroClub Auditions).
- **Review Trail:** Tested drag-and-drop file readers and touch camera triggers.

---

## 📌 Issue #4: Side-by-Side Split View Verification & Uncertainty Handling

- **Title:** `feat: split-view verification UI & uncertainty detection cards`
- **Branch:** `feat/verification-split-view`
- **PR:** `#9 feat: side-by-side verification canvas and uncertainty badges`
- **Linked:** `Closes #4`
- **Changes:**
  - Created `SplitViewComparison.tsx` with responsive zoom/pan controls.
  - Built `StructuredResultCard.tsx` highlighting plain-language summary, confirmed logistics, urgent deadlines, and unreadable/torn text flags.
  - Transparent model attribution badge displaying model ID and inference latency.
- **Review Trail:** Verified responsive 2-column layout on desktop and single-column on mobile.

---

## 📌 Issue #5: Action Toolbar with One-Click Calendar (.ics) Export & WhatsApp Sharing

- **Title:** `feat: calendar (.ics) generation & instant share actions`
- **Branch:** `feat/action-export-toolbar`
- **PR:** `#10 feat: RFC 5545 iCalendar generation and group sharing`
- **Linked:** `Closes #5`
- **Changes:**
  - Implemented RFC 5545 standard `.ics` calendar generator in `calendar-export.ts`.
  - Added copyable markdown summary for student notes.
  - Added one-click WhatsApp message composer for student club groups.
- **Review Trail:** Validated `.ics` downloads in Apple Calendar and Google Calendar format.

---

## 📌 Issue #6: Automated GitHub Actions CI/CD Pipeline

- **Title:** `ci: automated lint, unit test, and Next.js build verification`
- **Branch:** `chore/ci-pipeline`
- **PR:** `#11 chore: configure GitHub Actions workflow for lint and build`
- **Linked:** `Closes #6`
- **Changes:**
  - Added `.github/workflows/ci.yml` running on Node 20.
  - Validates `npm run lint`, `npm test`, and `npm run build` on every push and PR.
- **Review Trail:** Verified clean 0-warning exit.
