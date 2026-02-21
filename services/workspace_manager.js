// services/workspace_manager.js

export const WorkspaceManager = {
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

  fetchDriveFiles: async (token) => {
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=15&orderBy=quotaBytesUsed desc&fields=files(id, name, size, mimeType)',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (!response.ok) {
      throw new Error(`Drive API Error: ${response.statusText}`);
    }
    return await response.json();
  },

  fetchCalendarEvents: async (token) => {
    const timeMin = new Date().toISOString();
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=10&singleEvents=true&orderBy=startTime&fields=items(summary,location,start,attendees)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) {
      throw new Error(`Calendar API Error: ${response.statusText}`);
    }
    return await response.json();
  }
};