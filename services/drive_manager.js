// services/drive_manager.js

export const DriveManager = {
  // Requests the OAuth token from the browser session
  getAuthToken: () => {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          console.error("Auth Error:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        }
        resolve(token);
      });
    });
  },

  // NEW: Fetch File List for Gemini to Analyze
  fetchFiles: async (token) => {
    // We limit to 20 files to stay safely within free-tier token limits
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id, name, size, mimeType)',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (!response.ok) {
      throw new Error(`Drive API Error: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // RENAMED: Logic to save the JSON results back to Drive for persistence
  saveMetricsToDrive: async (token, auditData) => {
    const metadata = {
      name: 'GreenSync_Audit.json',
      mimeType: 'application/json'
    };

    const fileContent = JSON.stringify(auditData);
    const file = new Blob([fileContent], { type: 'application/json' });
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });

    const formData = new FormData();
    formData.append('metadata', metadataBlob);
    formData.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to save audit to Drive');
    }

    return await response.json();
  }
};