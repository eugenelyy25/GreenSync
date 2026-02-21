// Mocking DOM extraction from Google Drive
const mockDriveData = () => {
  const files = [
    { name: "Old_Backup_2022.zip", size: "2GB", date: "2022-01-01" },
    { name: "Draft_Video_Project.mov", size: "500MB", date: "2023-05-12" }
  ];
  chrome.runtime.sendMessage({ type: "DRIVE_DATA", payload: files });
};

if (window.location.href.includes("drive.google.com")) {
  console.log("GreenSync: Drive detected. Scoping files...");
  mockDriveData();
}