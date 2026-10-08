# InfoFusion (PS01 Enterprise Intelligence Platform)

> **"From scattered information to trusted decisions."**  
> *ChatGPT/Claude answer questions. InfoFusion creates a verified, traceable, decision-ready information system from many sources.*

---

## 🌟 The Killer Differentiator

| Traditional Generative AI | InfoFusion Enterprise Platform |
| :--- | :--- |
| **User asks:** "What does this document say?" | **User ingests:** 5 multi-format documents (PDF, Excel, Email, Tech Spec) |
| **AI response:** A 3-paragraph plausible prose summary. | **InfoFusion Output:** <br>• **147 normalized facts extracted**<br>• **18 verified facts**<br>• **3 contradictions detected** (e.g. ₹5.2L vs ₹4.8L)<br>• **2 missing evidence items** (unsubstantiated ISO 27001)<br>• **5 high-impact findings**<br>• **4 recommended mitigation actions** |
| Blind to mathematical contradictions across spreadsheets. | **DECISION STATUS: ⚠️ REVIEW REQUIRED** |
| Prone to hallucinating citations or dates. | Strict anti-hallucination guardrails & exact byte/page provenance. |

---

## 🚀 3-Minute Judge Evaluation Walkthrough

To demo the complete **FIND → UNDERSTAND → ORGANIZE → VERIFY → DECIDE → ACT** lifecycle:

1. **Step 1 — Open Demo Scenario**  
   Navigate to [`http://127.0.0.1:5173/demo`](http://127.0.0.1:5173/demo) or click the **"Judge Demo Mode"** button in the top navigation bar.
2. **Step 2 — Ingested Sources**  
   Visit the **Sources** tab to see 5 heterogeneous files (`Proposal_Acme_Cloud_ERP.pdf`, `Commercial_Quotation_Acme.xlsx`, `Vendor_Email_SLAs_Clarification.pdf`, etc.) processed across the 5 pipeline stages:  
   `Uploading → Extracting → Structuring → Analyzing → Ready`.
3. **Step 3 — Main Dashboard Health**  
   Review the **Information Health** gauge (🟢 18 Verified, 🔴 3 Conflicting, 🟡 16 Uncertain, ⚫ 2 Missing Evidence).
4. **Step 4 — Contradiction Radar**  
   Open **Contradiction Radar** (`/conflicts`) to examine the pricing discrepancy:
   - **Proposal (Page 4):** ₹5,20,000 (INR 5.2 L)
   - **Quotation (Row 18):** ₹4,80,000 (INR 4.8 L)
   - **Variance Delta:** ₹40,000
5. **Step 5 — Deep Investigation**  
   Click **"Investigate"** on any conflict to inspect side-by-side evidence quotes with exact coordinates and resolve with audit notes.
6. **Step 6 — Missing Evidence Gaps**  
   Visit `/evidence-gaps` to inspect claims that lack proof. E.g. Vendor claims ISO 27001 & SOC 2 compliance, but certificate documents are not in repository. System marks this as `🟠 Evidence Required`.
7. **Step 7 — Decision Center**  
   Visit `/decisions` to examine the 5-factor risk matrix and executive verdict: **⚠️ REVIEW REQUIRED**.
8. **Step 8 — Action Center**  
   Visit `/actions` to track assigned remediation items (e.g., *Confirm final pricing*, *Verify support coverage SLA*).
9. **Step 9 — Multilingual AI Intelligence**  
   Visit `/ask` and query in **Tamil** (`இந்த vendor-க்கு என்னென்ன பிரச்சனைகள் இருக்கு?`), **Hindi** (`इस वेंडर के साथ क्या क्या समस्याएं हैं?`), or **Telugu**. The system understands the query and answers with citations in that language while preserving technical numbers.
10. **Step 10 — Evidence Explorer Graph**  
    Visit `/evidence-explorer` to visualize the deep hierarchical provenance:  
    `Decision → Finding → Claim → Source → Physical Page/Row`.
11. **Step 11 — AI Communication Generator**  
    Click **"Draft Outbound Comms"** to generate a clarification email or executive memo based *only* on verified findings.
12. **Step 12 — Report Center & PDF Export**  
    Visit `/reports` to download a real client-side compiled PDF Decision Brief.

---

## 🏗️ Technology Architecture

- **Frontend:** React 19 + TypeScript + Tailwind CSS (Custom Dark Navy `#0B0F19` & Electric Indigo design system)
- **Icons & Visuals:** Lucide React + Canvas Confetti + Custom Radar keyframe animations
- **Backend & Storage:** Supabase PostgreSQL + Supabase Auth + Supabase Storage with strict Row-Level Security (RLS)
- **Database Schema:** Located in [`supabase/schema.sql`](supabase/schema.sql) with 13 core tables, indexes, and RLS policies:
  1. `profiles`
  2. `workspaces`
  3. `workspace_members`
  4. `sources`
  5. `facts`
  6. `conflicts`
  7. `evidence`
  8. `findings`
  9. `finding_evidence`
  10. `decisions`
  11. `actions`
  12. `reports`
  13. `activity_logs`
- **PDF Generation:** `jspdf` client-side synthesis.
- **Multilingual Support:** Auto-detection for English, Tamil (தமிழ்), Hindi (हिन्दी), Telugu (తెలుగు), Malayalam (മലയാളം), Kannada (ಕನ್ನಡ), Bengali (বাংলা), Marathi, Gujarati, Punjabi, Urdu.

---

## 🛠️ Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
# Running at http://127.0.0.1:5173/

# 3. Build verification
npm run build
```
