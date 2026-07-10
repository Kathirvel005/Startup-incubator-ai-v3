const fs = require('fs');
let content = fs.readFileSync('d:/Project work/startup incubator ai v25/frontend/src/App.jsx', 'utf-8');

// 1. Add rememberMe state
content = content.replace(
  /const \[isLogin, setIsLogin\] = useState\(true\);/,
  "const [isLogin, setIsLogin] = useState(true);\n  const [rememberMe, setRememberMe] = useState(true);"
);

// 2. Modify token/user initialization
content = content.replace(
  /const \[token, setToken\] = useState\(localStorage\.getItem\('token'\) \|\| ''\);/,
  "const [token, setToken] = useState(sessionStorage.getItem('token') || localStorage.getItem('token') || '');"
);
content = content.replace(
  /const \[user, setUser\] = useState\(JSON\.parse\(localStorage\.getItem\('user'\) \|\| 'null'\)\);/,
  "const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || 'null'));"
);

// 3. Update handleAuth storage logic
const oldHandleAuthStorage = `      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));`;
const newHandleAuthStorage = `      if (rememberMe) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }`;
content = content.replace(oldHandleAuthStorage, newHandleAuthStorage);

// 4. Update handleGuestLogin storage logic
const oldGuestStorage = `      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));`;
const newGuestStorage = `      if (response.ok) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));`;
content = content.replace(oldGuestStorage, newGuestStorage);

// 5. Update handleLogout logic
const oldLogout = `  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');`;
const newLogout = `  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken('');`;
content = content.replace(oldLogout, newLogout);

// 6. Add checkbox to Auth Form UI
const checkboxUI = `
                {isLogin && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ accentColor: 'var(--accent)', cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <label htmlFor="rememberMe" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer' }}>
                      Remember me
                    </label>
                  </div>
                )}
`;
const oldAuthFormEnd = `                  </div>
                </div>

                <button 
                  type="submit" `;
const newAuthFormEnd = `                  </div>
                </div>
${checkboxUI}
                <button 
                  type="submit" `;
content = content.replace(oldAuthFormEnd, newAuthFormEnd);

fs.writeFileSync('d:/Project work/startup incubator ai v25/frontend/src/App.jsx', content);
