// popup/popup.js
document.addEventListener('DOMContentLoaded', () => {
    const carbonDisplay = document.getElementById('carbon-value');
    const itemsDisplay = document.getElementById('items-value');
    const suggestionText = document.getElementById('suggestion-text');
    const feedbackUI = document.getElementById('feedback-ui');
    const btnScanDrive = document.getElementById('btn-scan-drive');
    const btnScanCalendar = document.getElementById('btn-scan-calendar');
    
    let currentSuggestion = "";

    // 1. Initial Load: Pull last known metrics
    chrome.storage.local.get(['totalCarbon', 'lastSuggestion', 'lastItemsTargeted'], (data) => {
        carbonDisplay.textContent = data.totalCarbon || "0.00";
        itemsDisplay.textContent = data.lastItemsTargeted || "0";
        suggestionText.textContent = data.lastSuggestion || "Awaiting scan...";
        
        if (data.lastSuggestion) {
            currentSuggestion = data.lastSuggestion;
            feedbackUI.style.display = 'block';
        }
    });

    // 2. Trigger Google Drive Live Scan
    btnScanDrive.addEventListener('click', (e) => {
        e.target.disabled = true;
        e.target.textContent = "Analyzing Drive...";
        btnScanCalendar.disabled = true;
        suggestionText.textContent = "Authenticating and fetching live Drive files...";
        chrome.runtime.sendMessage({ type: "SCAN_WORKSPACE", target: "DRIVE" });
    });

    // 3. Trigger Google Calendar Live Scan
    btnScanCalendar.addEventListener('click', (e) => {
        e.target.disabled = true;
        e.target.textContent = "Analyzing Calendar...";
        btnScanDrive.disabled = true;
        suggestionText.textContent = "Authenticating and fetching upcoming events...";
        chrome.runtime.sendMessage({ type: "SCAN_WORKSPACE", target: "CALENDAR" });
    });

    // 4. Listen for completion from background.js
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "ANALYSIS_COMPLETE") {
            carbonDisplay.textContent = message.data.carbonSaved;
            itemsDisplay.textContent = message.data.itemsTargeted || 0;
            suggestionText.textContent = message.data.suggestion;
            currentSuggestion = message.data.suggestion;
            
            // Reset UI Buttons
            btnScanDrive.textContent = "Scan Live Drive";
            btnScanDrive.disabled = false;
            btnScanCalendar.textContent = "Scan Live Calendar";
            btnScanCalendar.disabled = false;
            
            // Reveal feedback tracking
            feedbackUI.style.display = 'block';
        }

        if (message.type === "ANALYSIS_ERROR") {
            alert("Analysis Failed: " + message.error);
            suggestionText.textContent = "Scan failed. Please try again.";
            
            // Reset UI Buttons on Error
            btnScanDrive.textContent = "Scan Live Drive";
            btnScanDrive.disabled = false;
            btnScanCalendar.textContent = "Scan Live Calendar";
            btnScanCalendar.disabled = false;
        }
    });

    // 5. Handle User Iteration Feedback
    const handleFeedback = (isHelpful) => {
        chrome.runtime.sendMessage({ 
            type: "USER_FEEDBACK", 
            payload: { helpful: isHelpful, suggestion: currentSuggestion } 
        }, () => {
            feedbackUI.innerHTML = "<p style='color: green; font-weight: bold;'>Thank you! Feedback recorded.</p>";
        });
    };

    document.getElementById('btn-yes').addEventListener('click', () => handleFeedback(true));
    document.getElementById('btn-no').addEventListener('click', () => handleFeedback(false));
});