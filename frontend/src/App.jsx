import React, { useState, useEffect } from 'react';
import { 
  Lock, User, Mail, Eye, EyeOff, Lightbulb, 
  DollarSign, Smartphone, BarChart3, FileDown, 
  History, LogOut, Sparkles, CheckCircle2, 
  ArrowRight, AlertTriangle, PlayCircle,
  Trash2, TrendingUp, PieChart, Shield, 
  AlertCircle, Zap, Ban
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import ParticleBackground from './components/ParticleBackground';
import Gauge from './components/Gauge';
import AIChat from './components/AIChat';
import AdminDashboard from './components/AdminDashboard';

const activeTheme = { name: 'Royal Violet', color: '#8b5cf6', dimColor: '#4c1d95' };

function App() {
  const [token, setToken] = useState(sessionStorage.getItem('token') || localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || 'null'));
  const [activeTab, setActiveTab] = useState(window.location.hash.replace('#', '') || 'home');
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Auto-login removed as user prefers separate login/register page


  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Idea Submission Form State
  const [title, setTitle] = useState('');
  const [explanation, setExplanation] = useState('');
  const [amount, setAmount] = useState('');
  const [platform, setPlatform] = useState('SaaS');
  const [formProgress, setFormProgress] = useState(0);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  // Analysis Reports State
  const [activeReport, setActiveReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Update progress bar
  useEffect(() => {
    let progress = 0;
    if (title.trim()) progress += 25;
    if (explanation.trim()) progress += 25;
    if (amount !== '' && parseFloat(amount) >= 0) progress += 25;
    if (platform) progress += 25;
    setFormProgress(progress);
  }, [title, explanation, amount, platform]);

  // Track page visit on mount
  useEffect(() => {
    if (!sessionStorage.getItem('hasVisited')) {
      fetch('/api/visit', { method: 'POST' })
        .then(() => sessionStorage.setItem('hasVisited', 'true'))
        .catch(err => console.error("Error tracking visit:", err));
    }
  }, []);

  // Time Tracking Heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      fetch('/api/track-time', {
        method: 'POST',
        headers,
        body: JSON.stringify({ seconds: 60 })
      }).catch(err => console.error("Error tracking time:", err));
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [token]);

  // Fetch History on load or when token changes
  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch('/api/ideas/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
        if (data.length > 0 && !activeReport) {
          setActiveReport(data[0]); // Load latest by default
        }
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/register';
    const payload = isLogin 
      ? { username: usernameInput, password: passwordInput }
      : { username: usernameInput, gmail: emailInput, password: passwordInput };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Backend server is offline. Please start server.js.');
      }

      if (!response.ok) {
        let errorMsg = data.error || 'Authentication failed';
        if (isLogin && response.status === 401) {
          errorMsg = 'Invalid credentials. If you are new, please click "Register New" below.';
        }
        throw new Error(errorMsg);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      
      // Navigate to dashboard
      const targetTab = data.user.isAdmin ? 'admin-dashboard' : 'live-demo';
      setActiveTab(targetTab);
      window.location.hash = targetTab;
      
      // Clear forms
      setUsernameInput('');
      setEmailInput('');
      setPasswordInput('');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setAuthLoading(true);
      const guestUser = `guest_${Math.floor(Math.random() * 100000)}`;
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: guestUser, gmail: `${guestUser}@example.com`, password: 'guestpassword' })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        const targetTab = data.user.isAdmin ? 'admin-dashboard' : 'live-demo';
        setActiveTab(targetTab);
        window.location.hash = targetTab;
      } else {
        setAuthError(data.error || 'Guest login failed');
      }
    } catch(err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleIdeaSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError('');
    setSubmissionLoading(true);

    if (!token) {
      setSubmissionError('Please login or create an account to submit your idea.');
      setSubmissionLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          explanation,
          amount: parseFloat(amount),
          platform
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Idea evaluation failed');
      }

      // Success Confetti Effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [activeTheme.color, activeTheme.dimColor, '#ffffff']
      });

      setActiveReport(data);
      setHistory(prev => [data, ...prev]);

      // Reset form
      setTitle('');
      setExplanation('');
      setAmount('');
      setPlatform('SaaS');
    } catch (err) {
      setSubmissionError(err.message);
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleLogout = () => {
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
  };

  const handleDeleteIdea = async (ideaId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this startup assessment?")) return;

    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        // We need to filter out the deleted item from the state
        setHistory(prev => {
          const updated = prev.filter(item => item.id !== ideaId);
          // If the deleted item was active, switch to the first remaining one
          if (activeReport?.id === ideaId) {
            setActiveReport(updated.length > 0 ? updated[0] : null);
          }
          return updated;
        });
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete idea.");
      }
    } catch (err) {
      console.error("Error deleting idea:", err);
      alert("Connection error. Could not delete assessment.");
    }
  };

  // Download PDF Report Builder (Native Vector PDF)
  const downloadPDFReport = (report) => {
    if (!report) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 0;

    const addHeader = () => {
      // Header Background
      doc.setFillColor(15, 23, 42); // Dark slate
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("LAUNCHMIND AI", margin, 22);

      // Subtitle & Date
      doc.setTextColor(156, 163, 175);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Comprehensive Startup Feasibility Report", margin, 29);
      
      doc.text(`Generated: ${new Date(report.timestamp).toLocaleDateString()}`, pageWidth - margin - 40, 29);
      y = 55;
    };

    addHeader();

    // Utility for adding new pages
    const checkPageBreak = (spaceNeeded) => {
      if (y + spaceNeeded > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
    };

    // --- Concept Overview ---
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    
    // Title wrapping
    const titleLines = doc.splitTextToSize(report.title, pageWidth - margin * 2);
    doc.text(titleLines, margin, y);
    y += (titleLines.length * 7) + 5;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    const descLines = doc.splitTextToSize(`"${report.explanation}"`, pageWidth - margin * 2);
    doc.text(descLines, margin, y);
    y += (descLines.length * 5) + 12;

    // --- Key Metrics Section ---
    checkPageBreak(50);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 35, 3, 3, 'FD');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Executive Scoring", margin + 5, y + 8);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Metric 1: Success
    doc.setTextColor(34, 197, 94); // Green
    doc.text(`Success Probability: ${report.successRate}%`, margin + 5, y + 16);
    doc.setFillColor(220, 253, 230); doc.rect(margin + 5, y + 19, 50, 4, 'F');
    doc.setFillColor(34, 197, 94); doc.rect(margin + 5, y + 19, 50 * (report.successRate/100), 4, 'F');

    // Metric 2: Risk
    doc.setTextColor(249, 115, 22); // Orange
    doc.text(`Risk Coefficient: ${report.riskRate}%`, margin + 65, y + 16);
    doc.setFillColor(255, 237, 213); doc.rect(margin + 65, y + 19, 50, 4, 'F');
    doc.setFillColor(249, 115, 22); doc.rect(margin + 65, y + 19, 50 * (report.riskRate/100), 4, 'F');

    // Metric 3: Innovation
    doc.setTextColor(59, 130, 246); // Blue
    doc.text(`Innovation Score: ${report.innovationScore}%`, margin + 125, y + 16);
    doc.setFillColor(219, 234, 254); doc.rect(margin + 125, y + 19, 45, 4, 'F');
    doc.setFillColor(59, 130, 246); doc.rect(margin + 125, y + 19, 45 * (report.innovationScore/100), 4, 'F');

    y += 45;

    // --- Market & Financials ---
    checkPageBreak(50);
    
    // Market Size
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Market Potential", margin, y);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    
    if (report.marketSize) {
      doc.text(`Total Addressable Market (TAM): ${report.marketSize.tam}`, margin, y); y += 6;
      doc.text(`Serviceable Available Market (SAM): ${report.marketSize.sam}`, margin, y); y += 6;
      doc.text(`Serviceable Obtainable Market (SOM): ${report.marketSize.som}`, margin, y); y += 12;
    } else {
      doc.text("Market sizing details unavailable.", margin, y); y += 12;
    }

    // Capital Budget
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Financial Assessment", margin, y);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    
    doc.text(`Self-Funded Investment: $${report.amount.toLocaleString()}`, margin, y); y += 6;
    doc.text(`Required Market Budget: $${report.requiredAmount.toLocaleString()}`, margin, y); y += 8;

    if (report.isBudgetSufficient) {
      doc.setTextColor(34, 197, 94);
      doc.setFont("helvetica", "bold");
      doc.text("Status: Budget is sufficient to construct the target MVP.", margin, y);
    } else {
      doc.setTextColor(239, 68, 68);
      doc.setFont("helvetica", "bold");
      doc.text(`Status: Insufficient budget. Deficit: $${report.remainingAmount.toLocaleString()}`, margin, y);
    }
    y += 12;

    // --- Recommendations ---
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Strategic Recommendations", margin, y);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);

    report.recommendations.forEach((rec, idx) => {
      const recLines = doc.splitTextToSize(`${idx + 1}. ${rec}`, pageWidth - margin * 2);
      checkPageBreak(recLines.length * 5 + 5);
      doc.text(recLines, margin, y);
      y += (recLines.length * 5) + 3;
    });

    y += 8;
    checkPageBreak(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(139, 92, 246); // Violet
    doc.text(`Projected Success Post-Optimization: ${report.projectedSuccessRate}%`, margin, y);
    y += 15;

    // --- Action Plan ---
    doc.addPage();
    y = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("Implementation Roadmap", margin, y);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 15;

    report.steps.forEach((step) => {
      checkPageBreak(30);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text(`${step.phase} (${step.duration})`, margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      
      step.tasks.forEach((task) => {
        const taskLines = doc.splitTextToSize(`• ${task}`, pageWidth - margin * 2 - 5);
        checkPageBreak(taskLines.length * 5 + 5);
        doc.text(taskLines, margin + 5, y);
        y += (taskLines.length * 5) + 2;
      });
      y += 8;
    });

    // Save report
    doc.save(`LaunchMind-AI-${report.title.replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <>
      <div className="animated-bg" />
      <div className="radial-glow glow-top-right" />
      <div className="radial-glow glow-bottom-left" />
      <ParticleBackground />

      {/* Main Container */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Navigation Bar */}
        <header
          className="glass-card"
          style={{
            margin: '1rem',
            padding: '1rem 2rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)'
            }}>
              <Sparkles size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>
                STARTUP INCUBATOR <span style={{ color: 'var(--accent)' }}>AI</span>
              </h1>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Accredited AI Feasibility Modeling
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {['Home', 'Features', 'About'].map((item) => {
              const tabId = item.toLowerCase().replace(' ', '-');
              return (
                <a 
                  key={item} 
                  href={`#${tabId}`}
                  onClick={(e) => { e.preventDefault(); setActiveTab(tabId); window.location.hash = tabId; }}
                  className={`nav-link ${activeTab === tabId ? 'active' : ''}`}
                  style={{ color: activeTab === tabId ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  {item}
                </a>
              );
            })}
            {user?.isAdmin && (
              <a 
                href="#admin-dashboard"
                onClick={(e) => { e.preventDefault(); setActiveTab('admin-dashboard'); window.location.hash = 'admin-dashboard'; }}
                className={`nav-link ${activeTab === 'admin-dashboard' ? 'active' : ''}`}
                style={{ color: activeTab === 'admin-dashboard' ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 'bold' }}
              >
                Admin Dashboard
              </a>
            )}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              fontFamily: 'Outfit',
              letterSpacing: '0.5px'
            }}>
              Powered by <span style={{ color: 'var(--accent)', fontWeight: '600' }}>Kathirvel T</span>
            </div>
            {token && user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => { setActiveTab('profile'); window.location.hash = 'profile'; }} title="Edit Profile">
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(var(--accent-rgb), 0.1)',
                    border: '1px solid rgba(var(--accent-rgb), 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    {user.profileIcon && user.profileIcon.length > 0 ? ((user.profileIcon.startsWith('http') || user.profileIcon.startsWith('data:image')) ? <img src={user.profileIcon} style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} /> : user.profileIcon) : user.username.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: '500' }}>
                    {user.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', height: '36px' }}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
            <div style={{ background: 'rgba(13, 11, 18, 0.6)', padding: '4rem', borderRadius: '24px', border: '1px solid rgba(139,92,246,0.3)', backdropFilter: 'blur(20px)', maxWidth: '800px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(139,92,246,0.15)', borderRadius: '20px', color: '#a78bfa', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '2rem', border: '1px solid rgba(139,92,246,0.4)' }}>
                <Sparkles size={16} /> <span>THE FUTURE OF STARTUPS</span>
              </div>
              <h1 style={{ fontFamily: 'Outfit', fontSize: '4.5rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.1', textShadow: '0 0 40px rgba(139, 92, 246, 0.4)' }}>
                Welcome to <br /> <span className="text-gradient-primary">LaunchMind AI</span>
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6', fontWeight: '400' }}>
                Your ultimate AI-powered incubator. Validate, build, and scale your next big idea with accredited feasibility modeling and real-time market insights.
              </p>
              <div style={{ marginBottom: '3rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <img src="/startup_hero.png" alt="Startup Innovation" style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block' }} />
              </div>
              <button 
                className="btn-primary" 
                style={{ padding: '1.2rem 3rem', fontSize: '1.1rem', borderRadius: '50px' }}
                onClick={() => { 
                  if (!token) {
                    setActiveTab('auth'); 
                    window.location.hash = 'auth'; 
                  } else {
                    setActiveTab('live-demo'); 
                    window.location.hash = 'live-demo'; 
                  }
                }}
              >
                Start Incubation <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '3rem', fontWeight: '700', marginBottom: '1.5rem' }}>Platform Features</h2>
            <div style={{ marginBottom: '3rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', maxWidth: '1000px', width: '100%' }}>
              <img src="/ai_analytics.png" alt="AI Analytics" style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', width: '100%' }}>
              <div className="glass-card glass-card-hover">
                <BarChart3 size={32} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                <h3>AI Feasibility Score</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Instantly evaluate your startup idea with our advanced AI scoring model.</p>
              </div>
              <div className="glass-card glass-card-hover">
                <PieChart size={32} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                <h3>Market Analysis</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Get instant TAM, SAM, and SOM estimations tailored to your specific niche.</p>
              </div>
              <div className="glass-card glass-card-hover">
                <TrendingUp size={32} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                <h3>SWOT Generation</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Automatically generate a complete SWOT analysis for strategic planning.</p>
              </div>
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
            <div className="glass-card glass-card-hover" style={{ maxWidth: '700px', padding: '3rem', width: '100%' }}>
              <div style={{ marginBottom: '2rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', width: '100%' }}>
                <img src="/innovation_lightbulb.png" alt="Innovation" style={{ width: '100%', height: '250px', objectFit: 'cover', display: 'block' }} />
              </div>
              <Shield size={48} color="var(--accent)" style={{ marginBottom: '1.5rem' }} />
              <h2 style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>About LaunchMind AI</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                LaunchMind AI is built for visionaries. We believe that every great idea deserves a chance to be evaluated properly without the bias of traditional incubators. Our AI models are trained on thousands of successful startup trajectories to provide you with the most accurate feasibility models in the industry.
              </p>
            </div>
          </div>
        )}

        
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
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ 
                      username: e.target.username.value,
                      gmail: e.target.gmail.value,
                      profileIcon: e.target.profileIcon.dataset.base64 || user?.profileIcon 
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

        {/* Auth Tab (Login & Register) */}
        {activeTab === 'auth' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
            
            {/* Tutorial Guide */}
            <div className="fade-in" style={{ marginBottom: '4rem', width: '100%', maxWidth: '1000px' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>How It Works</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Follow these simple steps to start incubating your idea in the live demo.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(var(--accent-rgb), 0.1)', padding: '10px', borderRadius: '12px' }}>
                      <User size={24} color="var(--accent)" />
                    </div>
                    <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem' }}>1. Create & Login</h3>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>Use the form below to register a new account or login. This secures your session and saves your incubator history.</p>
                </div>
                
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(var(--accent-rgb), 0.1)', padding: '10px', borderRadius: '12px' }}>
                      <Lightbulb size={24} color="var(--accent)" />
                    </div>
                    <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem' }}>2. Submit Idea</h3>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>Fill out the idea submission form in the dashboard with your concept name, short explanation, and target platform.</p>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(var(--accent-rgb), 0.1)', padding: '10px', borderRadius: '12px' }}>
                      <BarChart3 size={24} color="var(--accent)" />
                    </div>
                    <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem' }}>3. Get AI Analysis</h3>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>Watch as LaunchMind AI evaluates feasibility, calculates market sizes, and builds a comprehensive SWOT matrix instantly.</p>
                </div>
              </div>
            </div>

            <div 
              className="glass-card fade-in"
              style={{
                width: '100%',
                maxWidth: '430px',
                border: '1px solid rgba(var(--accent-rgb), 0.2)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'Outfit', fontWeight: '700', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                  {isLogin ? 'Accelerate Your Vision' : 'Join the Incubator'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {isLogin ? 'Log in to evaluate your tech concept' : 'Register your incubation account to start'}
                </p>
              </div>

              {authError && (
                <div 
                  style={{
                    background: 'rgba(var(--accent-rgb), 0.1)',
                    border: '1px solid rgba(var(--accent-rgb), 0.3)',
                    color: '#fca5a5',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="glass-label">Username</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                      type="text"
                      className="glass-input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="startup_founder"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="fade-in">
                    <label className="glass-label">Email</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input
                        type="email"
                        className="glass-input"
                        style={{ paddingLeft: '2.5rem' }}
                        placeholder="founder@startup.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="glass-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="glass-input"
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ marginTop: '1rem' }}
                  disabled={authLoading}
                >
                  {authLoading ? 'Authenticating...' : (isLogin ? 'Enter Incubator' : 'Create Account')}
                </button>
              </form>

              <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {isLogin ? "Don't have an account? " : "Already registered? "}
                </span>
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setAuthError('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {isLogin ? 'Register New' : 'Log In Here'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Demo Tab (Dashboard Only) */}
        {activeTab === 'live-demo' && (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1rem', padding: '1rem', height: 'calc(100vh - 90px)' }}>
            
            {/* Left Column: Form & History */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '4px' }}>
              
              {/* Submission Form */}
              <div 
                className="glass-card" 
                style={{ 
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <Lightbulb size={20} style={{ color: 'var(--accent)' }} />
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: '700', fontSize: '1.1rem' }}>
                    YOUR IDEA SUBMISSION
                  </h3>
                </div>

                {submissionError && (
                  <div style={{ color: '#fca5a5', background: 'rgba(var(--accent-rgb), 0.15)', border: '1px solid rgba(var(--accent-rgb), 0.3)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
                    {submissionError}
                  </div>
                )}

                <form onSubmit={handleIdeaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="glass-label">Idea Name</label>
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="e.g. Smart Eco Recycler"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="glass-label">Explain your idea in small sentence</label>
                    <textarea
                      className="glass-input"
                      placeholder="What does it solve in a short line?"
                      rows={2}
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      required
                      style={{ resize: 'none' }}
                    />
                  </div>

                  <div>
                    <label className="glass-label">Amount you have ($)</label>
                    <div style={{ position: 'relative' }}>
                      <DollarSign size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input
                        type="number"
                        className="glass-input"
                        style={{ paddingLeft: '2rem' }}
                        placeholder="e.g. 20000"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="glass-label">Target Platform</label>
                    <select
                      className="glass-input"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                    >
                      <option value="SaaS">SaaS Platform</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="Web Platform">Web Platform</option>
                      <option value="AI / ML Engine">AI / ML Engine</option>
                      <option value="IoT / Hardware">IoT / Hardware</option>
                      <option value="Desktop Client">Desktop Client</option>
                      <option value="BioTech / Healthcare">BioTech / Healthcare</option>
                    </select>
                  </div>

                  <div style={{ marginTop: '0.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>Analysis Completion Strength</span>
                      <span>{formProgress}%</span>
                    </div>
                    <div className="progress-container">
                      <div className="progress-bar" style={{ width: `${formProgress}%` }} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                    disabled={submissionLoading}
                  >
                    {submissionLoading ? (
                      'Simulating Feasibility Model...'
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Run AI Assessment
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* History Slot */}
              <div className="glass-card" style={{ flex: 1, minHeight: '240px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <History size={18} style={{ color: 'var(--text-secondary)' }} />
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: '700', fontSize: '1rem' }}>
                    HISTORY LOGS
                  </h3>
                </div>

                {historyLoading ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading history records...</p>
                ) : history.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No previous startup assessments found.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                    {history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setActiveReport(item)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.75rem',
                          background: activeReport?.id === item.id ? 'rgba(var(--accent-rgb), 0.12)' : 'rgba(255,255,255,0.02)',
                          border: activeReport?.id === item.id ? '1px solid rgba(var(--accent-rgb), 0.3)' : '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '8px' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.88rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                              {item.title}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 'bold', flexShrink: 0 }}>
                              {item.successRate}% Success
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span>{item.platform}</span>
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteIdea(item.id, e)}
                          className="delete-btn"
                          title="Delete assessment"
                          style={{ flexShrink: 0 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Report Active Viewer */}
            <div style={{ overflowY: 'auto', paddingRight: '4px' }}>
              {activeReport ? (
                <div id="report-container" className="glass-card fade-in" style={{ border: '1px solid rgba(var(--accent-rgb), 0.2)' }}>
                  
                  {/* Report Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                        Active Analytical Report
                      </span>
                      <h2 style={{ fontFamily: 'Outfit', fontWeight: '700', fontSize: '1.8rem', color: '#fff', marginTop: '4px' }}>
                        {activeReport.title}
                      </h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', italic: 'true', marginTop: '2px' }}>
                        "{activeReport.explanation}"
                      </p>
                    </div>

                    <button
                      id="export-btn"
                      onClick={() => downloadPDFReport(activeReport)}
                      className="btn-primary"
                      style={{ padding: '0.6rem 1.2rem', fontSize: '0.88rem' }}
                    >
                      <FileDown size={16} />
                      Export Report (PDF)
                    </button>
                  </div>

                  {/* Main Metric Gauges */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '1.5rem' }}>
                    <Gauge value={activeReport.successRate} label="Success Probability" color={activeTheme.color} size={120} />
                    <Gauge value={activeReport.riskRate} label="Risk Coefficient" color="#f97316" size={120} />
                    <Gauge value={activeReport.innovationScore} label="Innovation Score" color="#3b82f6" size={120} />
                  </div>

                  {/* Budget Assessment and Peer benchmark */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    
                    {/* Budget assessment */}
                    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                      <h4 style={{ fontFamily: 'Outfit', fontWeight: '600', color: '#fff', fontSize: '0.95rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Financial Adequacy Assessment
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Funding Allocated:</span>
                          <span style={{ fontWeight: '600' }}>${activeReport.amount.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Required Base Capital:</span>
                          <span style={{ fontWeight: '600' }}>${activeReport.requiredAmount.toLocaleString()}</span>
                        </div>
                        <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', margin: '4px 0' }} />
                        {activeReport.isBudgetSufficient ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontWeight: '600', marginTop: '4px' }}>
                            <CheckCircle2 size={16} />
                            <span>Surplus Capital Confirmed</span>
                          </div>
                        ) : (
                          <div style={{ marginTop: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f97316', fontWeight: '600', marginBottom: '2px' }}>
                              <AlertTriangle size={16} />
                              <span>Insufficient Capital</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fca5a5', fontSize: '0.85rem' }}>
                              <span>Funding Deficit Remaining:</span>
                              <span style={{ fontWeight: '700' }}>-${activeReport.remainingAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Benchmark Peer */}
                    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                      <h4 style={{ fontFamily: 'Outfit', fontWeight: '600', color: '#fff', fontSize: '0.95rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Historical Peer Benchmark
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Similar Startup:</span>
                          <span style={{ fontWeight: '600', color: '#fff' }}>{activeReport.similarStartup.name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Target Industry:</span>
                          <span style={{ fontWeight: '600' }}>{activeReport.similarStartup.industry}</span>
                        </div>
                        <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', margin: '4px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent)', fontWeight: '600', marginTop: '4px' }}>
                          <span>Market Success Rate:</span>
                          <span style={{ textShadow: '0 0 5px rgba(var(--accent-rgb),0.3)' }}>{activeReport.similarStartup.successRate}%</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Market Potential and Capital Allocation */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    
                    {/* Market Sizing */}
                    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                        <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
                        <h4 style={{ fontFamily: 'Outfit', fontWeight: '600', color: '#fff', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Market Size Potential
                        </h4>
                      </div>
                      
                      {activeReport.marketSize ? (
                        <div className="market-progress-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          {/* TAM */}
                          <div className="market-item">
                            <div className="market-label-row">
                              <span className="label">TAM (Total Addressable Market)</span>
                              <span className="value">{activeReport.marketSize.tam}</span>
                            </div>
                            <div className="market-track">
                              <div className="market-fill tam" style={{ width: '100%' }} />
                            </div>
                          </div>
                          {/* SAM */}
                          <div className="market-item">
                            <div className="market-label-row">
                              <span className="label">SAM (Serviceable Market)</span>
                              <span className="value">{activeReport.marketSize.sam}</span>
                            </div>
                            <div className="market-track">
                              <div className="market-fill sam" style={{ width: `${Math.max(10, Math.min(100, (activeReport.marketSize.samVal / activeReport.marketSize.tamVal) * 100))}%` }} />
                            </div>
                          </div>
                          {/* SOM */}
                          <div className="market-item">
                            <div className="market-label-row">
                              <span className="label">SOM (Target Share SOM)</span>
                              <span className="value">{activeReport.marketSize.som}</span>
                            </div>
                            <div className="market-track">
                              <div className="market-fill som" style={{ width: `${Math.max(5, Math.min(100, (activeReport.marketSize.somVal / activeReport.marketSize.tamVal) * 100))}%` }} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Market sizing details unavailable for this report.</p>
                      )}
                    </div>

                    {/* Capital Budget Allocation */}
                    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                        <PieChart size={16} style={{ color: 'var(--accent)' }} />
                        <h4 style={{ fontFamily: 'Outfit', fontWeight: '600', color: '#fff', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Capital Budget Allocation
                        </h4>
                      </div>
                      
                      {activeReport.budgetBreakdown ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {activeReport.budgetBreakdown.map((item, idx) => (
                            <div key={idx} style={{ fontSize: '0.82rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{item.category}</span>
                                <span style={{ fontWeight: '600', color: '#fff' }}>${item.allocated.toLocaleString()} ({item.percentage}%)</span>
                              </div>
                              <div className="progress-container" style={{ height: '4px' }}>
                                <div className="progress-bar" style={{ width: `${item.percentage}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Capital breakdown details unavailable.</p>
                      )}
                    </div>

                  </div>

                  {/* SWOT Matrix Analysis */}
                  <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                      <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                      <h4 style={{ fontFamily: 'Outfit', fontWeight: '600', color: '#fff', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Strategic SWOT Profile
                      </h4>
                    </div>
                    
                    {activeReport.swot ? (
                      <div className="swot-grid">
                        {/* Strengths */}
                        <div className="swot-quadrant strength">
                          <div className="swot-title strength">
                            <Shield size={14} />
                            <span>Strengths (S)</span>
                          </div>
                          <ul className="swot-list">
                            {activeReport.swot.strengths.map((str, idx) => (
                              <li key={idx}>{str}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="swot-quadrant weakness">
                          <div className="swot-title weakness">
                            <AlertCircle size={14} />
                            <span>Weaknesses (W)</span>
                          </div>
                          <ul className="swot-list">
                            {activeReport.swot.weaknesses.map((weak, idx) => (
                              <li key={idx}>{weak}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Opportunities */}
                        <div className="swot-quadrant opportunity">
                          <div className="swot-title opportunity">
                            <Zap size={14} />
                            <span>Opportunities (O)</span>
                          </div>
                          <ul className="swot-list">
                            {activeReport.swot.opportunities.map((opp, idx) => (
                              <li key={idx}>{opp}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Threats */}
                        <div className="swot-quadrant threat">
                          <div className="swot-title threat">
                            <Ban size={14} />
                            <span>Threats (T)</span>
                          </div>
                          <ul className="swot-list">
                            {activeReport.swot.threats.map((thr, idx) => (
                              <li key={idx}>{thr}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>SWOT strategic profile details unavailable for this report.</p>
                    )}
                  </div>

                  {/* AI Recommendations */}
                  <div style={{ padding: '1.25rem', background: 'rgba(var(--accent-rgb), 0.03)', border: '1px solid rgba(var(--accent-rgb), 0.12)', borderRadius: '12px', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <h4 style={{ fontFamily: 'Outfit', fontWeight: '600', color: '#fff', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        AI Optimization Strategy
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#fca5a5', fontWeight: 'bold' }}>
                        <span>Projected Success Score:</span>
                        <span style={{ background: 'var(--accent)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>{activeReport.projectedSuccessRate}%</span>
                      </div>
                    </div>
                    
                    <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      {activeReport.recommendations.map((rec, idx) => (
                        <li key={idx} style={{ lineHeight: '1.4' }}>
                          <strong style={{ color: '#f1f5f9' }}>{rec.split(' ')[0]}</strong> {rec.split(' ').slice(1).join(' ')}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Implementation Roadmap */}
                  <div>
                    <h4 style={{ fontFamily: 'Outfit', fontWeight: '600', color: '#fff', fontSize: '0.95rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Real-Life Implementation Timeline
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      {activeReport.steps.map((step, idx) => (
                        <div 
                          key={idx}
                          style={{
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.04)',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase' }}>
                            {step.duration}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff', lineHeight: '1.2' }}>
                            {step.phase}
                          </span>
                          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', margin: '4px 0' }} />
                          <ul style={{ paddingLeft: '10px', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {step.tasks.map((task, tIdx) => (
                              <li key={tIdx} style={{ lineHeight: '1.3' }}>{task}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                /* Empty state */
                <div 
                  className="glass-card" 
                  style={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '3rem',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.04)'
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(var(--accent-rgb), 0.05)',
                    border: '1px solid rgba(var(--accent-rgb), 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    marginBottom: '1.5rem',
                    animation: 'float 4s ease-in-out infinite'
                  }}>
                    <PlayCircle size={32} />
                  </div>
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: '700', fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>
                    Awaiting Incubation Input
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '400px', lineHeight: '1.5' }}>
                    Submit your venture concept using the form on the left, or review past logs to generate instant analytical evaluations.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Admin Dashboard Tab */}
        {activeTab === 'admin-dashboard' && user?.isAdmin && (
          <AdminDashboard token={token} />
        )}
      </div>

      {/* Floating Chat Bubble widget removed */}
    </>
  );
}

export default App;
