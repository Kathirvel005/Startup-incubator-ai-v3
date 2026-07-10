const fs = require('fs');
let content = fs.readFileSync('d:/Project work/startup incubator ai v25/frontend/src/App.jsx', 'utf-8');

// 1. Update header to accept data:image
content = content.replace(
  /user\.profileIcon\.startsWith\('http'\)/g,
  "(user.profileIcon.startsWith('http') || user.profileIcon.startsWith('data:image'))"
);

// 2. Update the Profile form
const oldFormInput = `                <div>
                  <label className="glass-label">Profile Icon (Emoji or URL)</label>
                  <input name="profileIcon" type="text" className="glass-input" defaultValue={user?.profileIcon || ''} placeholder="e.g. 🚀 or URL" />
                </div>`;

const newFormInput = `                <div>
                  <label className="glass-label">Profile Image (Upload)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {user?.profileIcon && (user?.profileIcon.startsWith('http') || user?.profileIcon.startsWith('data:image')) ? (
                      <img src={user.profileIcon} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="Current Profile" />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(var(--accent-rgb), 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 'bold' }}>
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <input 
                      name="profileIcon" 
                      type="file" 
                      accept="image/*" 
                      className="glass-input" 
                      style={{ padding: '0.5rem' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            e.target.dataset.base64 = reader.result;
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </div>
                </div>`;

content = content.replace(oldFormInput, newFormInput);

const oldSubmitBody = `                      profileIcon: e.target.profileIcon.value`;
const newSubmitBody = `                      profileIcon: e.target.profileIcon.dataset.base64 || user?.profileIcon`;

content = content.replace(oldSubmitBody, newSubmitBody);

fs.writeFileSync('d:/Project work/startup incubator ai v25/frontend/src/App.jsx', content);
