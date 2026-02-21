# GreenSync Technical Architecture

## 1. System Overview
GreenSync is a Chrome Extension (Manifest V3) designed to optimize digital carbon footprints by acting as a multi-role AI agent. It bridges **Google Workspace (Drive)** metadata with **Google AI Studio (Gemini)** to provide actionable environmental insights.

## 2. Component Mapping
* **Frontend (Popup UI):** Built with pure JS/CSS. It handles user interactions, displays real-time metrics, and collects user feedback for model iteration.
* **Orchestrator (Background Service Worker):** Manages the asynchronous lifecycle of the audit, coordinating between Auth, Drive, and AI services.
* **Brain (Gemini 2.0 Flash):** Processes file metadata via structured prompt engineering to switch between 'Drive Storage' and 'Mobility' optimization roles.
* **Data Layer:** Uses Google Drive API for decentralized persistence of audit results (GreenSync_Audit.json).

## 3. Communication Flow
1. **Extraction:** `DriveManager` fetches file metadata (names/sizes) via OAuth2.
2. **Analysis:** Metadata is passed to `generateAISuggestion` where Gemini identifies low-value, high-carbon-cost items.
3. **Quantification:** Carbon savings are calculated using a coefficient of $1 \times 10^{-6} \text{ kg CO}_2/\text{MB}$.
4. **Persistence:** Final metrics are synced to Chrome Local Storage for UI and uploaded to Google Drive for cross-session history.

## 4. Technical Justification
- **Manifest V3:** Adheres to the latest security standards, utilizing Service Workers and declarative permissions.
- **JSON Mode:** Enforces strictly typed AI responses to ensure the extension remains stable and crash-proof during parsing.
- **Resiliency:** Implements exponential backoff to maximize utility of the Gemini Free Tier (15 RPM).