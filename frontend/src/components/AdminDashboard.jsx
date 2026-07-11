import React, { useState, useEffect } from 'react';
import { Users, BarChart3, Clock, AlertTriangle, Lightbulb, Mail, Send, Timer } from 'lucide-react';

const AdminDashboard = ({ token }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingReport, setSendingReport] = useState(false);
  const [reportMessage, setReportMessage] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch admin data');
        }
        
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [token]);

  const handleSendReport = async () => {
    setSendingReport(true);
    setReportMessage('');
    try {
      const response = await fetch('/api/admin/send-report', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send report');
      }
      
      if (result.previewUrl) {
        setReportMessage(`Report sent! Preview it here: ${result.previewUrl}`);
      } else {
        setReportMessage('Report sent successfully!');
      }
    } catch (err) {
      setReportMessage(`Error: ${err.message}`);
      setTimeout(() => setReportMessage(''), 5000);
    } finally {
      setSendingReport(false);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div style={{ color: '#fca5a5', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #ef4444' }}>
          <AlertTriangle size={24} style={{ marginBottom: '0.5rem' }} />
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>
          Admin <span style={{ color: 'var(--accent)' }}>Dashboard</span>
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {reportMessage && (
            <div style={{ color: reportMessage.startsWith('Error') ? '#ef4444' : '#22c55e', fontSize: '0.9rem', fontWeight: '500' }}>
              {reportMessage.includes('http') ? (
                <span>Report generated! <a href={reportMessage.split('Preview it here: ')[1]} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Click here to view the email preview</a></span>
              ) : (
                reportMessage
              )}
            </div>
          )}
          <button 
            onClick={handleSendReport}
            disabled={sendingReport}
            className="action-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'rgba(var(--accent-rgb), 0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '8px', cursor: sendingReport ? 'not-allowed' : 'pointer' }}
          >
            <Send size={18} />
            {sendingReport ? 'Sending...' : 'Send Weekly Report Now'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '15px', borderRadius: '12px' }}>
            <Clock size={32} color="#3b82f6" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Website Visits</p>
            <h3 style={{ fontSize: '2rem', fontWeight: '700' }}>{data.totalVisits}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '15px', borderRadius: '12px' }}>
            <Timer size={32} color="#8b5cf6" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Usage Time</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {Math.floor(data.totalTimeSeconds / 3600)}h {Math.floor((data.totalTimeSeconds % 3600) / 60)}m
            </h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(var(--accent-rgb), 0.1)', padding: '15px', borderRadius: '12px' }}>
            <Users size={32} color="var(--accent)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Users</p>
            <h3 style={{ fontSize: '2rem', fontWeight: '700' }}>{data.totalUsers}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '15px', borderRadius: '12px' }}>
            <BarChart3 size={32} color="#22c55e" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Logins</p>
            <h3 style={{ fontSize: '2rem', fontWeight: '700' }}>{data.totalLogins}</h3>
          </div>
        </div>
      </div>

      {/* Visitor Emails Section */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <Mail size={24} color="var(--accent)" />
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: '600' }}>Registered Visitor Emails</h3>
        </div>
        
        {data.users.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {data.users.map(u => (
              <div key={u.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>
                {u.gmail}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>No registered users yet.</p>
        )}
      </div>

      {/* Users List */}
      <div className="glass-card" style={{ padding: '2rem', overflowX: 'auto' }}>
        <h3 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>User Activity Logs</h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>User</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Time Spent</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Logins</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Last Login</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Ideas Generated</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <div style={{ fontWeight: '600' }}>{u.username}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.gmail}</div>
                </td>
                <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem' }}>
                  {Math.floor((u.totalTimeSeconds || 0) / 3600)}h {Math.floor(((u.totalTimeSeconds || 0) % 3600) / 60)}m
                </td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <span style={{ background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {u.loginCount}
                  </span>
                </td>
                <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                </td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Lightbulb size={14} color="var(--accent)" />
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{u.ideasCount} Ideas</span>
                  </div>
                  {u.ideas.length > 0 && (
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {u.ideas.slice(0, 3).map(idea => (
                        <li key={idea.id} style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: '500', color: '#fff' }}>{idea.title}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>${idea.amount}</span>
                        </li>
                      ))}
                      {u.ideas.length > 3 && (
                        <li style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>+ {u.ideas.length - 3} more...</li>
                      )}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.users.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No users found in the system.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
