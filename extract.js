const fs = require('fs');
const lines = fs.readFileSync('d:/Project work/startup incubator ai v25/frontend/src/App.backup.jsx', 'utf-8').split('\n');

console.log('--- Functions ---');
['function App()', 'const fetchHistory =', 'const handleAuth =', 'const handleGuestLogin =', 'const handleIdeaSubmit =', 'const handleLogout =', 'const handleDeleteIdea =', 'const downloadPDF ='].forEach(s => {
  const i = lines.findIndex(l => l.includes(s));
  console.log(s, ':', i + 1);
});

console.log('--- UI Sections ---');
['<nav className', "{activeTab === 'home'", "{activeTab === 'features'", "{activeTab === 'about'", "{activeTab === 'auth'", "{activeTab === 'live-demo'"].forEach(s => {
  const i = lines.findIndex(l => l.includes(s));
  console.log(s, ':', i + 1);
});
