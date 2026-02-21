// background.js
import { generateAISuggestion } from './services/ai_agent.js';
import { WorkspaceManager } from './services/workspace_manager.js';
import { saveCarbonMetrics, saveFeedback } from './services/firebase_manager.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCAN_WORKSPACE") {
    handleWorkspaceScan(message.target, sendResponse);
    return true; // Keeps async channel open
  }
  
  if (message.type === "USER_FEEDBACK") {
    saveFeedback(message.payload).then(() => sendResponse({ success: true }));
    return true;
  }
});

async function handleWorkspaceScan(target, sendResponse) {
  try {
    const token = await WorkspaceManager.getAuthToken();
    let data = [];
    let role = "";
    
    // Route to the correct Google API
    if (target === "DRIVE") {
        const driveData = await WorkspaceManager.fetchDriveFiles(token);
        data = driveData.files;
        role = "Drive Storage Optimizer";
    } else if (target === "CALENDAR") {
        const calendarData = await WorkspaceManager.fetchCalendarEvents(token);
        data = calendarData.items;
        role = "Mobility Optimizer";
    }

    // Pass live data to Gemini AI
    const aiAnalysis = await generateAISuggestion(role, data);
    
    // Save longitudinal metrics to Firestore
    await saveCarbonMetrics({
      source: target,
      carbonSaved: aiAnalysis.carbonSaved,
      suggestion: aiAnalysis.suggestion,
      timestamp: new Date().toISOString()
    });

    // Save strictly to local storage for immediate UI rendering
    await chrome.storage.local.set({
      totalCarbon: aiAnalysis.carbonSaved,
      lastSuggestion: aiAnalysis.suggestion,
      lastItemsTargeted: aiAnalysis.itemsTargeted || 0
    });

    // Notify the UI
    chrome.runtime.sendMessage({ type: "ANALYSIS_COMPLETE", data: aiAnalysis });
    if (sendResponse) sendResponse({ success: true });

  } catch (error) {
    console.error("Scan Failed:", error);
    chrome.runtime.sendMessage({ type: "ANALYSIS_ERROR", error: error.message });
  }
}