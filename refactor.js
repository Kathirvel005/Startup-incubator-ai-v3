const fs = require('fs');
const path = require('path');

const srcDir = 'd:/Project work/startup incubator ai v25/frontend/src';
const appJsxPath = path.join(srcDir, 'App.backup.jsx');
const lines = fs.readFileSync(appJsxPath, 'utf-8').split('\n');

const getLines = (start, end) => lines.slice(start - 1, end).join('\n');

// 1. pdfGenerator.js
const pdfGeneratorContent = `import { jsPDF } from 'jspdf';\n\nexport ` + getLines(259, 463).replace('const downloadPDFReport = (report) => {', 'const downloadPDFReport = (report) => {');
fs.writeFileSync(path.join(srcDir, 'utils', 'pdfGenerator.js'), pdfGeneratorContent);

// 2. Home.jsx
const homeLines = getLines(574, 605)
  .replace("{activeTab === 'home' && (", "")
  .replace(/<div className="tab-pane fade-in active">/, "")
  .replace(/<\/div>\s*\)}/, "")
  .trim();
const homeContent = `import React from 'react';\nimport { ArrowRight, Sparkles, Target, Zap } from 'lucide-react';\n\nexport default function Home({ setActiveTab }) {\n  return (\n    <div className="tab-pane fade-in active">\n      ${homeLines}\n    </div>\n  );\n}\n`;
fs.writeFileSync(path.join(srcDir, 'pages', 'Home.jsx'), homeContent);

// 3. Features.jsx
const featureLines = getLines(606, 629)
  .replace("{activeTab === 'features' && (", "")
  .replace(/<div className="tab-pane fade-in active">/, "")
  .replace(/<\/div>\s*\)}/, "")
  .trim();
const featuresContent = `import React from 'react';\nimport { Eye, Shield, Target, Zap, FileDown, PieChart } from 'lucide-react';\n\nexport default function Features() {\n  return (\n    <div className="tab-pane fade-in active">\n      ${featureLines}\n    </div>\n  );\n}\n`;
fs.writeFileSync(path.join(srcDir, 'pages', 'Features.jsx'), featuresContent);

// 4. About.jsx
const aboutLines = getLines(630, 642)
  .replace("{activeTab === 'about' && (", "")
  .replace(/<div className="tab-pane fade-in active">/, "")
  .replace(/<\/div>\s*\)}/, "")
  .trim();
const aboutContent = `import React from 'react';\n\nexport default function About() {\n  return (\n    <div className="tab-pane fade-in active">\n      ${aboutLines}\n    </div>\n  );\n}\n`;
fs.writeFileSync(path.join(srcDir, 'pages', 'About.jsx'), aboutContent);

// 5. Auth.jsx
const authLines = getLines(643, 827)
  .replace("{activeTab === 'auth' && (", "")
  .replace(/<div className="tab-pane fade-in active">/, "")
  .replace(/<\/div>\s*\)}/, "")
  .trim();
const authContent = `import React, { useState } from 'react';
import { Lock, User, Mail, Eye, EyeOff, AlertTriangle, ArrowRight } from 'lucide-react';

export default function Auth({ setGlobalToken, setGlobalUser, setActiveTab }) {
${getLines(24, 34)}
${getLines(87, 164)}

  return (
    <div className="tab-pane fade-in active">
      ${authLines}
    </div>
  );
}
`.replace(/setToken\(/g, 'setGlobalToken(').replace(/setUser\(/g, 'setGlobalUser(');
fs.writeFileSync(path.join(srcDir, 'pages', 'Auth.jsx'), authContent);

// 6. LiveDemo.jsx
const liveDemoLines = getLines(828, 1349)
  .replace("{activeTab === 'live-demo' && (", "")
  .replace(/<div className="tab-pane fade-in active dashboard-layout">/, "")
  .replace(/<\/div>\s*\)}/, "")
  .trim();
const liveDemoContent = `import React, { useState, useEffect } from 'react';
import { 
  History, LogOut, FileDown, Trash2, PieChart, TrendingUp, AlertCircle, Sparkles, CheckCircle2, PlayCircle, Lightbulb, DollarSign, Smartphone, BarChart3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { downloadPDFReport } from '../utils/pdfGenerator';
import Gauge from '../components/Gauge';
import AIChat from '../components/AIChat';

const activeTheme = { name: 'Royal Violet', color: '#8b5cf6', dimColor: '#4c1d95' };

export default function LiveDemo({ token }) {
${getLines(37, 85)}
${getLines(166, 218)}
${getLines(229, 256)}

  return (
    <div className="tab-pane fade-in active dashboard-layout">
      ${liveDemoLines}
    </div>
  );
}
`;
fs.writeFileSync(path.join(srcDir, 'pages', 'LiveDemo.jsx'), liveDemoContent);

// 7. Navbar.jsx
const navLines = getLines(472, 571);
const navbarContent = `import React from 'react';
import { Sparkles, LogOut, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, token, user, handleLogout }) {
  return (
${navLines}
  );
}
`;
fs.writeFileSync(path.join(srcDir, 'components', 'Navbar.jsx'), navbarContent);

// 8. Footer.jsx
const footerLines = getLines(1351, 1358);
const footerContent = `import React from 'react';

export default function Footer() {
  return (
${footerLines}
  );
}
`;
fs.writeFileSync(path.join(srcDir, 'components', 'Footer.jsx'), footerContent);

// 9. App.jsx (New)
const appContent = `import React, { useState } from 'react';
import ParticleBackground from './components/ParticleBackground';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Features from './pages/Features';
import About from './pages/About';
import Auth from './pages/Auth';
import LiveDemo from './pages/LiveDemo';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [activeTab, setActiveTab] = useState(window.location.hash.replace('#', '') || 'home');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setActiveTab('home');
    window.location.hash = 'home';
  };

  return (
    <>
      <div className="animated-bg" />
      <div className="radial-glow glow-top-right" />
      <div className="radial-glow glow-bottom-left" />
      <ParticleBackground />
      
      <main className="app-container">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          token={token} 
          user={user} 
          handleLogout={handleLogout} 
        />
        
        <div className="tab-content">
          {activeTab === 'home' && <Home setActiveTab={setActiveTab} />}
          {activeTab === 'features' && <Features />}
          {activeTab === 'about' && <About />}
          {activeTab === 'auth' && (
            <Auth 
              setGlobalToken={setToken} 
              setGlobalUser={setUser} 
              setActiveTab={setActiveTab} 
            />
          )}
          {activeTab === 'live-demo' && <LiveDemo token={token} />}
        </div>

        <Footer />
      </main>
    </>
  );
}

export default App;
`;
fs.writeFileSync(path.join(srcDir, 'App.jsx'), appContent);
console.log('Refactoring complete!');
