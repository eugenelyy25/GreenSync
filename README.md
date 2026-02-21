## ⚠️ Technical Challenges & Decisions
- **Challenge**: Asynchronous Gemini API calls in a Manifest V3 Service Worker.
- **Decision**: Implemented a "Request-Response" messaging pattern where the Service Worker stays active just long enough to process the fetch request, ensuring we don't hit the 30-second execution timeout.
- **Challenge**: Google Drive API token expiry.
- **Decision**: Used `chrome.identity.getAuthToken({ interactive: false })` to silently refresh tokens in the background without interrupting the user.
- **Challenge**: Securely managing API keys in a client-side extension without a backend.
- **Decision**: Implemented a localized configuration pattern with strict .gitignore rules to prevent credential leakage during version control.