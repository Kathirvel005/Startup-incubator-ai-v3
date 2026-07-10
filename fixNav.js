const fs = require('fs');
const lines = fs.readFileSync('d:/Project work/startup incubator ai v25/frontend/src/App.backup.jsx', 'utf-8').split('\n');
const navLines = lines.slice(474, 571).join('\n'); // Starts at <header
const navbarContent = `import React from 'react';
import { Sparkles, LogOut, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, token, user, handleLogout }) {
  return (
    <>
${navLines}
    </>
  );
}
`;
fs.writeFileSync('d:/Project work/startup incubator ai v25/frontend/src/components/Navbar.jsx', navbarContent);
