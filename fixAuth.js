const fs = require('fs');
const path = require('path');
const lines = fs.readFileSync('d:/Project work/startup incubator ai v25/frontend/src/App.backup.jsx', 'utf-8').split('\n');
const getLines = (start, end) => lines.slice(start - 1, end).join('\n');

const authLines = getLines(643, 827)
  .replace("{activeTab === 'auth' && (", "")
  .replace(/<div className="tab-pane fade-in active">/, "")
  .replace(/<\/div>\s*\)}/, "")
  .trim();
  
// Fix the closing div for Auth.jsx properly
const authLinesFixed = authLines + '\n    </div>';

const authContent = `import React, { useState } from 'react';
import { Lock, User, Mail, Eye, EyeOff, AlertTriangle, ArrowRight, Lightbulb, BarChart3 } from 'lucide-react';

export default function Auth({ setGlobalToken, setGlobalUser, setActiveTab }) {
${getLines(24, 34)}
${getLines(87, 164)}

  return (
    <div className="tab-pane fade-in active">
      ${authLinesFixed}
    </div>
  );
}
`.replace(/setToken\(/g, 'setGlobalToken(').replace(/setUser\(/g, 'setGlobalUser(');
fs.writeFileSync('d:/Project work/startup incubator ai v25/frontend/src/pages/Auth.jsx', authContent);
