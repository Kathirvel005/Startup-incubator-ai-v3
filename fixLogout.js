const fs = require('fs');
let content = fs.readFileSync('d:/Project work/startup incubator ai v25/frontend/src/App.jsx', 'utf-8');

const oldLogout = `  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken('');
    setUser(null);
    setActiveReport(null);
    setHistory([]);
  };`;

const newLogout = `  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken('');
    setUser(null);
    setActiveReport(null);
    setHistory([]);
    setActiveTab('home');
    window.location.hash = 'home';
  };`;

// Also in case the previous script addRememberMe.js partially failed and left it without sessionStorage
const oldLogoutAlt = `  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setActiveReport(null);
    setHistory([]);
  };`;

if (content.includes(oldLogout)) {
  content = content.replace(oldLogout, newLogout);
} else if (content.includes(oldLogoutAlt)) {
  content = content.replace(oldLogoutAlt, newLogout);
}

fs.writeFileSync('d:/Project work/startup incubator ai v25/frontend/src/App.jsx', content);
