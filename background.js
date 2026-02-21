// background.js
import { generateAISuggestion } from './services/ai_agent.js';
import { DriveManager } from './services/drive_manager.js';

// Standard V3 Listener: Cannot be async directly
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_ECO_AUDIT") {
    // Run the async logic in a separate self-invoking function
    handleAudit(sendResponse);
    return true; // Crucial: Keeps the message channel open for async response
  }
});

async function handleAudit(sendResponse) {
  try {
    const token = await DriveManager.getAuthToken();
    const driveData = await DriveManager.fetchFiles(token);
    
    // Send real Drive metadata to Gemini
    const aiAnalysis = await generateAISuggestion('Drive Storage Optimizer', driveData.files);
    
    // Save to Google Drive (Persistence)
    await DriveManager.saveMetricsToDrive(token, {
      lastAudit: new Date().toISOString(),
      analysis: aiAnalysis,
      totalCarbonSaved: aiAnalysis.carbonSaved
    });

    // Save to local storage for immediate Popup UI access
    await chrome.storage.local.set({
      totalCarbon: aiAnalysis.carbonSaved,
      lastSuggestion: aiAnalysis.suggestion
    });

    // Notify UI that we are done
    chrome.runtime.sendMessage({ type: "AUDIT_COMPLETE", data: aiAnalysis });
    if (sendResponse) sendResponse({ success: true });

  } catch (error) {
    console.error("Audit Failed:", error);
    chrome.runtime.sendMessage({ type: "AUDIT_ERROR", error: error.message });
  }
}