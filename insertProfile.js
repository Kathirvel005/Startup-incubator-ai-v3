const fs = require('fs');
let content = fs.readFileSync('d:/Project work/startup incubator ai v25/frontend/src/App.jsx', 'utf-8');

// 1. Update the Header (make name clickable and show profile icon)
content = content.replace(
  /{user\.username\.charAt\(0\)\.toUpperCase\(\)}/g,
  "{user.profileIcon && user.profileIcon.length > 0 ? (user.profileIcon.startsWith('http') ? <img src={user.profileIcon} style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} /> : user.profileIcon) : user.username.charAt(0).toUpperCase()}"
);

content = content.replace(
  /<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>/,
  "<div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => { setActiveTab('profile'); window.location.hash = 'profile'; }} title=\"Edit Profile\">"
);

// 2. Insert Profile tab
const profileTabCode = `
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Profile Settings</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Update your account details</p>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
                    body: JSON.stringify({ 
                      username: e.target.username.value,
                      gmail: e.target.gmail.value,
                      profileIcon: e.target.profileIcon.value 
                    })
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    alert('Profile updated successfully!');
                  } else {
                    alert(data.error || 'Failed to update profile');
                  }
                } catch (err) {
                  alert('Error updating profile');
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="glass-label">Profile Icon (Emoji or URL)</label>
                  <input name="profileIcon" type="text" className="glass-input" defaultValue={user?.profileIcon || ''} placeholder="e.g. 🚀 or URL" />
                </div>
                <div>
                  <label className="glass-label">Username</label>
                  <input name="username" type="text" className="glass-input" defaultValue={user?.username || ''} required />
                </div>
                <div>
                  <label className="glass-label">Email</label>
                  <input name="gmail" type="email" className="glass-input" defaultValue={user?.gmail || ''} required />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}
`;

content = content.replace(
  /{\/\* Auth Tab \(Login & Register\) \*\/}/,
  profileTabCode + '\n        {/* Auth Tab (Login & Register) */}'
);

fs.writeFileSync('d:/Project work/startup incubator ai v25/frontend/src/App.jsx', content);
