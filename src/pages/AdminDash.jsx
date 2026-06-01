import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import {
  LayoutDashboard, FlaskConical, Megaphone, ChartLine, Users,
  Truck, LogOut, Droplet, Zap, Image,
  CheckCircle2, Search, Send, AlertTriangle,
  X, TrendingUp
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS — identiques au dash Admin HTML
   ───────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  :root {
    --red:      #9d0208;
    --red-dark: #7b0206;
    --red-glow: rgba(157,2,8,.25);
    --bg:       #07090f;
    --bg2:      #0d1117;
    --border:   rgba(255,255,255,.07);
    --glass:    rgba(255,255,255,.04);
    --glass2:   rgba(255,255,255,.07);
    --text:     #f1f5f9;
    --muted:    rgba(255,255,255,.35);
    --muted2:   rgba(255,255,255,.12);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); }
  body::before {
    content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    background-size: 150px; opacity: .4;
  }
  body::after {
    content: ''; position: fixed; top: -200px; right: -200px;
    width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(157,2,8,.12) 0%, transparent 70%);
    z-index: 0; pointer-events: none;
  }
  .admin-main::-webkit-scrollbar { width: 4px; }
  .admin-main::-webkit-scrollbar-track { background: transparent; }
  .admin-main::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  @keyframes pulse-green { 0%,100%{box-shadow:0 0 4px #10b981} 50%{box-shadow:0 0 12px #10b981} }
  @keyframes border-pulse { 0%,100%{border-color:rgba(239,68,68,.3)} 50%{border-color:rgba(239,68,68,.7)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .live-dot { width:7px;height:7px;border-radius:50%;background:#10b981;animation:pulse-green 1.5s infinite;display:inline-block; }
  .page-anim { animation: fadeUp .35s ease; }
  .cell-crit { animation: border-pulse 2s ease-in-out infinite; }
`;

/* ─────────────────────────────────────────────────────────────
   NORMALISATION CLÉS API
   Laravel stocke 'O-' (tiret court), React affiche 'O−' (tiret long)
   ───────────────────────────────────────────────────────────── */
const toApiKey = (g) => g.replace('−', '-');

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────────────────────── */
const Pill = ({ variant = 'ok', children, style = {} }) => {
  const map = {
    ok:   { bg:'rgba(16,185,129,.12)',  color:'#10b981', border:'rgba(16,185,129,.2)' },
    warn: { bg:'rgba(245,158,11,.12)',  color:'#f59e0b', border:'rgba(245,158,11,.2)' },
    err:  { bg:'rgba(239,68,68,.12)',   color:'#ef4444', border:'rgba(239,68,68,.25)' },
    info: { bg:'rgba(59,130,246,.12)',  color:'#93c5fd', border:'rgba(59,130,246,.2)' },
  };
  const s = map[variant];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'.3rem', padding:'.25rem .65rem',
      borderRadius:'.4rem', fontSize:'.6rem', fontWeight:800, textTransform:'uppercase',
      letterSpacing:'.08em', background:s.bg, color:s.color, border:`1px solid ${s.border}`, ...style }}>
      {children}
    </span>
  );
};

const ProgressBar = ({ pct, color }) => (
  <div style={{ height:5, background:'var(--glass2)', borderRadius:99, overflow:'hidden' }}>
    <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:99, transition:'width .6s ease' }} />
  </div>
);

const KpiCard = ({ accent, label, value, sub, subColor = 'var(--muted)', note }) => (
  <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'1.25rem',
    padding:'1.4rem 1.5rem', position:'relative', overflow:'hidden', transition:'border-color .2s' }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--glass2)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
  >
    <div style={{ position:'absolute', top:0, left:0, width:3, height:'100%', background:accent, borderRadius:'2px 0 0 2px' }} />
    <div style={{ fontSize:'.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.12em', color:'var(--muted)' }}>{label}</div>
    <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'2.2rem', fontWeight:900, letterSpacing:'-.03em', margin:'.3rem 0' }}>{value}</div>
    <div style={{ fontSize:'.68rem', fontWeight:600, color:subColor }}>{sub}</div>
    {note && <div style={{ fontSize:'.65rem', color:'var(--muted)', marginTop:'.4rem' }}>{note}</div>}
  </div>
);

const BloodCell = ({ group, status, badge }) => {
  const styles = {
    ok:   { bg:'rgba(16,185,129,.08)', border:'rgba(16,185,129,.2)', lbl:'#10b981', txt:'Stable' },
    warn: { bg:'rgba(245,158,11,.08)', border:'rgba(245,158,11,.2)', lbl:'#f59e0b', txt:'Vigilance' },
    crit: { bg:'rgba(239,68,68,.1)',   border:'rgba(239,68,68,.3)',  lbl:'#ef4444', txt:'Critique' },
  };
  const s = styles[status];
  return (
    <div className={status === 'crit' ? 'cell-crit' : ''} style={{ borderRadius:'.85rem', padding:'.9rem .75rem',
      textAlign:'center', border:`1px solid ${s.border}`, background:s.bg, position:'relative',
      transition:'transform .2s', cursor:'default' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
    >
      {badge && (
        <div style={{ position:'absolute', top:-6, right:-6, width:18, height:18, borderRadius:'50%',
          background:'#ef4444', color:'#fff', fontSize:'.6rem', fontWeight:900,
          display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 8px rgba(239,68,68,.6)' }}>
          {badge}
        </div>
      )}
      <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'1.3rem', fontWeight:900, letterSpacing:'-.03em' }}>{group}</div>
      <div style={{ fontSize:'.58rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em', marginTop:'.3rem', color:s.lbl }}>{s.txt}</div>
    </div>
  );
};

const TabGroup = ({ tabs, active, onChange }) => (
  <div style={{ display:'flex', background:'var(--glass)', borderRadius:'.75rem', padding:3, border:'1px solid var(--border)' }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)} style={{ padding:'.4rem .9rem', borderRadius:'.6rem',
        fontSize:'.68rem', fontWeight:700, color:active === t.id ? '#fff' : 'var(--muted)',
        background:active === t.id ? 'var(--red)' : 'transparent',
        boxShadow:active === t.id ? '0 4px 12px var(--red-glow)' : 'none',
        border:'none', cursor:'pointer', transition:'background .2s, color .2s' }}>
        {t.label}
      </button>
    ))}
  </div>
);

const TableWrap = ({ children }) => (
  <div style={{ overflowX:'auto' }}>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>{children}</table>
  </div>
);

const Th = ({ children, align = 'left' }) => (
  <th style={{ padding:'.9rem 1.25rem', fontSize:'.6rem', fontWeight:800, textTransform:'uppercase',
    letterSpacing:'.12em', color:'var(--muted)', textAlign:align, borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>
    {children}
  </th>
);

const Td = ({ children, align = 'left', style = {} }) => (
  <td style={{ padding:'.9rem 1.25rem', fontSize:'.75rem', fontWeight:500,
    borderBottom:'1px solid rgba(255,255,255,.03)', verticalAlign:'middle', textAlign:align, ...style }}>
    {children}
  </td>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'1.25rem', overflow:'hidden', ...style }}>
    {children}
  </div>
);

const CardPad = ({ children, style = {} }) => (
  <div style={{ padding:'1.5rem', ...style }}>{children}</div>
);

const BtnRed = ({ children, onClick, style = {} }) => (
  <button onClick={onClick} style={{ background:'var(--red)', color:'#fff', border:'none', borderRadius:'.75rem',
    padding:'.8rem 1.5rem', fontSize:'.75rem', fontWeight:700, cursor:'pointer',
    transition:'opacity .2s, transform .15s', display:'inline-flex', alignItems:'center', gap:'.5rem', ...style }}
    onMouseEnter={e => { e.currentTarget.style.opacity='.9'; e.currentTarget.style.transform='translateY(-1px)'; }}
    onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='none'; }}
  >{children}</button>
);

// Correction — BtnRed ne peut pas s'appeler récursivement
const Btn = ({ children, onClick, style = {}, variant = 'red' }) => {
  const base = {
    border:'none', borderRadius:'.75rem', padding:'.8rem 1.5rem', fontSize:'.75rem', fontWeight:700,
    cursor:'pointer', transition:'opacity .2s, transform .15s', display:'inline-flex', alignItems:'center', gap:'.5rem',
  };
  const variants = {
    red:   { background:'var(--red)', color:'#fff' },
    ghost: { background:'var(--glass)', color:'var(--text)', border:'1px solid var(--border)' },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => { e.currentTarget.style.opacity='.9'; e.currentTarget.style.transform='translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='none'; }}
    >{children}</button>
  );
};

const FInput = ({ style = {}, ...props }) => (
  <input style={{ width:'100%', background:'var(--glass)', border:'1px solid var(--border)', borderRadius:'.75rem',
    padding:'.75rem 1rem', color:'var(--text)', fontSize:'.8rem', fontFamily:'DM Sans,sans-serif',
    outline:'none', appearance:'none', ...style }}
    onFocus={e => { e.target.style.borderColor='var(--red)'; e.target.style.background='rgba(157,2,8,.06)'; }}
    onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.background='var(--glass)'; }}
    {...props}
  />
);

const FSelect = ({ style = {}, children, ...props }) => (
  <select style={{ width:'100%', background:'var(--glass)', border:'1px solid var(--border)', borderRadius:'.75rem',
    padding:'.75rem 1rem', color:'var(--text)', fontSize:'.8rem', fontFamily:'DM Sans,sans-serif',
    outline:'none', appearance:'none', ...style }}
    onFocus={e => e.target.style.borderColor='var(--red)'}
    onBlur={e => e.target.style.borderColor='var(--border)'}
    {...props}
  >{children}</select>
);

const FLabel = ({ children, color }) => (
  <label style={{ fontSize:'.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.12em',
    color:color || 'var(--muted)', display:'block', marginBottom:'.4rem' }}>
    {children}
  </label>
);

const NavLabel = ({ children, style = {} }) => (
  <div style={{ fontSize:'.58rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.15em',
    color:'var(--muted2)', padding:'0 1rem', margin:'1.25rem 0 .5rem', ...style }}>
    {children}
  </div>
);

const NavBtn = ({ icon, label, active, onClick, badge }) => (
  <button onClick={onClick} style={{ width:'100%', display:'flex', alignItems:'center', gap:'.85rem',
    padding:'.7rem 1rem', borderRadius:'.75rem', fontSize:'.78rem', fontWeight:600,
    color:active ? '#fff' : 'var(--muted)', background:active ? 'rgba(157,2,8,.15)' : 'transparent',
    border:active ? '1px solid rgba(157,2,8,.2)' : '1px solid transparent',
    cursor:'pointer', transition:'background .2s, color .2s', textAlign:'left' }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background='var(--glass2)'; e.currentTarget.style.color='var(--text)'; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--muted)'; } }}
  >
    <span style={{ width:18, textAlign:'center', fontSize:'.8rem', color:active ? '#ff4d4d' : 'inherit' }}>{icon}</span>
    {label}
    {badge && <span style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'#ef4444', boxShadow:'0 0 6px #ef4444', display:'inline-block', flexShrink:0 }} />}
  </button>
);

const AlertPoster = React.forwardRef(({ groupe, poches }, ref) => (
  <div ref={ref} style={{ background:'#fff', color:'#111', borderRadius:'1.25rem', padding:'2.5rem',
    maxWidth:580, margin:'0 auto', boxShadow:'0 40px 80px rgba(0,0,0,.5)' }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
      <div>
        <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:900, fontSize:'1.1rem', letterSpacing:'-.02em' }}>
          SANG<span style={{ color:'#9d0208' }}>&</span>VIE
        </div>
        <div style={{ fontSize:'.6rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'#666', marginTop:2 }}>
          CNHU-HKM · Cotonou, Bénin
        </div>
      </div>
      <div style={{ background:'#9d0208', color:'#fff', fontSize:'.6rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'.1em', padding:'.35rem .85rem', borderRadius:999 }}>
        Alerte nationale
      </div>
    </div>
    <div style={{ display:'flex', alignItems:'center', gap:'2rem', padding:'1.5rem 0', borderTop:'4px solid #111', borderBottom:'4px solid #111', marginBottom:'2rem' }}>
      <div style={{ width:100, height:100, borderRadius:'50%', background:'#111', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'2rem', fontWeight:900, color:'#fff', letterSpacing:'-.03em' }}>{groupe}</span>
      </div>
      <div>
        <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'2.5rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'-.04em', lineHeight:.9 }}>
          Besoin<br/>Immédiat
        </div>
        <div style={{ color:'#9d0208', fontSize:'.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', marginTop:'.5rem' }}>
          Urgence Vitale au CNHU-HKM
        </div>
      </div>
    </div>
    <p style={{ fontSize:'1rem', fontWeight:700, textTransform:'uppercase', marginBottom:'2rem', lineHeight:1.4 }}>
      Nous recherchons <span style={{ color:'#9d0208', textDecoration:'underline', textUnderlineOffset:3 }}>{poches || '20'}</span> donneurs volontaires pour stabiliser les stocks de réanimation.
    </p>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', paddingTop:'1.25rem', borderTop:'1px solid #eee' }}>
      <div>
        <div style={{ fontSize:'.6rem', fontWeight:700, textTransform:'uppercase', color:'#999', marginBottom:'.3rem' }}>Contact UTS Direct</div>
        <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'1.1rem', fontWeight:900 }}>+229 21 30 10 45</div>
      </div>
      <div style={{ background:'#111', color:'#fff', padding:'.4rem .85rem', borderRadius:'.5rem', fontSize:'.65rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'.08em' }}>
        #SangVieBénin
      </div>
    </div>
  </div>
));

const Toast = ({ notif }) => {
  if (!notif.show) return null;
  const isOk = notif.type === 'success';
  return (
    <div style={{ position:'fixed', bottom:'2rem', right:'2rem', zIndex:999, background:'var(--bg2)',
      border:`1px solid ${isOk ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'}`,
      borderRadius:'.75rem', padding:'.85rem 1.25rem', display:'flex', alignItems:'center', gap:'.75rem',
      fontSize:'.73rem', fontWeight:600, color:isOk ? '#10b981' : '#ef4444',
      boxShadow:'0 20px 40px rgba(0,0,0,.5)', maxWidth:360, animation:'fadeUp .35s ease' }}>
      {isOk ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      <span>{notif.message}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────────────── */
const AdminDash = () => {
  const navigate   = useNavigate();
  const posterRef  = useRef(null);

  const [user,        setUser]        = useState(null);
  const [activeTab,   setActiveTab]   = useState('vue-globale');
  const [heatmapTab,  setHeatmapTab]  = useState('CGR');
  const [stats,       setStats]       = useState(null);
  const [donors,      setDonors]      = useState([]);
  const [poches,      setPoches]      = useState([]);
  const [searchTerm,  setSearchTerm]  = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showVisuel,  setShowVisuel]  = useState(false);
  const [alertCfg,    setAlertCfg]    = useState({ groupe: 'O−', besoin: '' });
  const [notif,       setNotif]       = useState({ show: false, message: '', type: '' });
  const [loading,     setLoading]     = useState({ stats: true, poches: false, donors: true });

  /* ── helpers ── */
  const token = () => localStorage.getItem('token');
  const authHeader = () => ({ headers: { Authorization: `Bearer ${token()}` } });
 const api = axios.create({ baseURL: 'https://sang-vie-back.onrender.com/api' });

  const notify = (message, type = 'success') => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: '', type: '' }), 3000);
  };

  /* ── fetch ── */
 const fetchStats = async () => {
  setLoading(prev => ({ ...prev, stats: true }));
  try {
    // On appelle la nouvelle route publique
    const res = await axios.get('https://sang-vie-back.onrender.com/api/stats-globales');
    setStats(res.data); 
  } catch (err) {
    console.error("Erreur stats:", err);
  } finally {
    setLoading(prev => ({ ...prev, stats: false }));
  }
};


  const fetchDonors = async () => {
  setLoading(p => ({ ...p, donors: true }));
  try {
    // Utilise authHeader() qui appelle désormais la bonne clé 'token'
    const r = await api.get('/donors', authHeader());
    setDonors(r.data);
  } catch (err) {
    console.error("Erreur donneurs:", err.response?.data || err.message);
  } finally {
    setLoading(p => ({ ...p, donors: false }));
  }
};


  const fetchPoches = async () => {
    setLoading(p => ({ ...p, poches: true }));
    try {
      const r = await api.get('/admin/poches', authHeader());
      setPoches(r.data);
    } catch { console.error('Erreur poches'); }
    finally { setLoading(p => ({ ...p, poches: false })); }
  };

  /* ── actions ── */
  const handlePublishAlert = async () => {
    if (!alertCfg.besoin) { notify('Veuillez entrer une quantité de poches.', 'error'); return; }
    try {
      await api.post('/admin/publish-alert', {
        group:           alertCfg.groupe.split(' ')[0], // 'O−' → 'O-' via Laravel
        needed_pockets:  alertCfg.besoin,
        location:        'CNHU-HKM (COTONOU)',
      }, authHeader());
      setShowVisuel(true);
      notify('Alerte de crise publiée avec succès.');
      fetchStats();
    } catch { notify('Erreur lors de la publication.', 'error'); }
  };

  const handleStopAlert = async () => {
    try {
      await api.post('/admin/publish-alert', { stop: true }, authHeader());
      setShowVisuel(false);
      notify('Alerte retirée.');
      fetchStats();
    } catch { notify('Erreur lors de la désactivation.', 'error'); }
  };

  const handleDestroyPoche = async (id) => {
    try {
      await api.patch(`/admin/poches/${id}/destroy`, {}, authHeader());
      notify('Poche détruite et retirée du stock.');
      fetchPoches();
    } catch { notify('Erreur lors de la destruction.', 'error'); }
  };

  const updateDonorStatus = async (id, status) => {
    try {
      await api.patch(`/donors/${id}/status`, { status }, authHeader());
      notify(`Statut mis à jour : ${status}`);
      fetchDonors();
    } catch { notify('Erreur lors de la mise à jour.', 'error'); }
  };

  const downloadPoster = () => {
    if (!posterRef.current) return;
    html2canvas(posterRef.current).then(canvas => {
      const a = document.createElement('a');
      a.download = `ALERTE-SANG-${alertCfg.groupe}.png`;
      a.href = canvas.toDataURL();
      a.click();
    });
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  /* ── effects ── */
  useEffect(() => {
    const stored = localStorage.getItem('USER_DATA');
    if (stored) try { setUser(JSON.parse(stored)); } catch(e) { console.error(e); }
    fetchStats();
    fetchDonors();
  }, []);

  useEffect(() => {
    if (activeTab === 'vue-globale') fetchStats();
    if (activeTab === 'inventaire')  fetchPoches();
    if (activeTab === 'donneurs')    fetchDonors();
  }, [activeTab]);

  /* ── horloge ── */
  const [clock, setClock] = useState('');
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit', second:'2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── blood group status — normalisé ── */
  const bloodStatus = (g) => {
  // On nettoie le groupe (ex: "O−" devient "O-") pour correspondre au JSON Laravel
  const cleanGroup = g.replace('−', '-'); 
  const count = stats?.stocks_par_groupe?.[cleanGroup] ?? 0; // 0 par défaut si pas trouvé

  if (count < 5)  return { status: 'crit', badge: String(count).padStart(2, '0') };
  if (count < 15) return { status: 'warn', badge: String(count).padStart(2, '0') };
  return { status: 'ok', badge: String(count).padStart(2, '0') };
};
  /* ── section meta ── */
  const sectionMeta = {
    'vue-globale':  { title:'Vue Globale',        sub:'Tableau de bord · CNHU-HKM Cotonou' },
    'inventaire':   { title:'Inventaire Précis',  sub:'Registre hémovigilance · Méthode FIFO' },
    'urgence-sang': { title:'Alerte Sang',         sub:'Génération de visuel de mobilisation' },
    
    'donneurs':     { title:'Base Donneurs',       sub:`${donors.length} donneurs enregistrés` },
  };

  const navItems = [
    { id:'vue-globale',  label:'Vue Globale',       icon:<LayoutDashboard size={14}/> },
    { id:'inventaire',   label:'Inventaire Précis',  icon:<FlaskConical size={14}/> },
    { id:'urgence-sang', label:'Alerte Sang',        icon:<Megaphone size={14}/>, badge:true },
    
    { id:'donneurs',     label:'Base Donneurs',       icon:<Users size={14}/> },
  ];

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
    : 'AG';


  return (
    <>
      <style>{CSS}</style>
      <div style={{ display:'flex', height:'100vh', position:'relative', zIndex:1 }}>

        {/* ════════════ SIDEBAR ════════════ */}
        <aside style={{ width:260, flexShrink:0, background:'var(--bg2)', borderRight:'1px solid var(--border)',
          display:'flex', flexDirection:'column', padding:'1.75rem 1.25rem',
          position:'sticky', top:0, height:'100vh', overflowY:'auto' }}>

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.75rem 1rem', marginBottom:'2rem' }}>
            <div style={{ width:36, height:36, background:'var(--red)', borderRadius:10, display:'flex',
              alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px var(--red-glow)', flexShrink:0 }}>
              <Droplet size={14} color="#fff" />
            </div>
            <div style={{ lineHeight:1 }}>
              <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:900, fontSize:'.95rem', letterSpacing:'-.02em' }}>
                SANG<span style={{ color:'#ef4444' }}>&</span>VIE
              </div>
              <div style={{ fontSize:'.6rem', fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.12em', marginTop:2 }}>
                CNHU-HKM · Cotonou
              </div>
            </div>
          </div>

          {/* Nav */}
          <NavLabel>Navigation</NavLabel>
          <nav style={{ display:'flex', flexDirection:'column', gap:'.25rem' }}>
            {navItems.map(item => (
              <NavBtn key={item.id} icon={item.icon} label={item.label}
                active={activeTab === item.id} badge={item.badge}
                onClick={() => setActiveTab(item.id)} />
            ))}
          </nav>

          {/* CNTS */}
          <NavLabel style={{ marginTop:'1.5rem' }}>Actions</NavLabel>
          <button onClick={() => setIsModalOpen(true)} style={{ width:'100%', display:'flex', alignItems:'center', gap:'.85rem',
            padding:'.7rem 1rem', borderRadius:'.75rem', fontSize:'.78rem', fontWeight:700, color:'#ff6b6b',
            background:'rgba(157,2,8,.08)', border:'1px solid rgba(157,2,8,.15)',
            cursor:'pointer', textAlign:'left', transition:'background .2s, color .2s', marginTop:'.5rem' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(157,2,8,.2)'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(157,2,8,.08)'; e.currentTarget.style.color='#ff6b6b'; }}
          >
            <span style={{ width:18, textAlign:'center', fontSize:'.8rem' }}><Truck size={14}/></span>
            <div>
              <div style={{ fontSize:'.75rem', fontWeight:700 }}>Réappro. CNTS</div>
              <div style={{ fontSize:'.58rem', opacity:.5, textTransform:'uppercase', letterSpacing:'.08em' }}>Liaison directe</div>
            </div>
            <span className="live-dot" style={{ marginLeft:'auto', flexShrink:0 }} />
          </button>

          {/* Agent card */}
          <div style={{ marginTop:'auto', paddingTop:'1rem', borderTop:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.75rem 1rem',
              borderRadius:'.75rem', background:'var(--glass)', border:'1px solid var(--border)' }}>
              <div style={{ width:34, height:34, borderRadius:9, background:'rgba(157,2,8,.2)', display:'flex',
                alignItems:'center', justifyContent:'center', fontSize:'.75rem', fontWeight:800, color:'#ff6b6b', flexShrink:0 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize:'.78rem', fontWeight:700 }}>{user?.name || 'Agent ANTS'}</div>
                <div style={{ fontSize:'.6rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em' }}>UTS · CNHU-HKM</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ width:'100%', display:'flex', alignItems:'center', gap:'.75rem',
              padding:'.6rem 1rem', marginTop:'.5rem', borderRadius:'.75rem', fontSize:'.72rem', fontWeight:600,
              color:'var(--muted)', background:'transparent', border:'none', cursor:'pointer', transition:'color .2s' }}
              onMouseEnter={e => e.currentTarget.style.color='#ff6b6b'}
              onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}
            >
              <LogOut size={13}/> Déconnexion
            </button>
          </div>
        </aside>

        {/* ════════════ MAIN ════════════ */}
        <main className="admin-main" style={{ flex:1, overflowY:'auto', padding:'2rem 2.5rem' }}>

          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
            marginBottom:'2rem', paddingBottom:'1.5rem', borderBottom:'1px solid var(--border)' }}>
            <div>
              <h1 style={{ fontFamily:'Montserrat,sans-serif', fontSize:'1.5rem', fontWeight:900, letterSpacing:'-.03em' }}>
                {sectionMeta[activeTab]?.title}
              </h1>
              <p style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:'.25rem', textTransform:'uppercase', letterSpacing:'.1em' }}>
                {sectionMeta[activeTab]?.sub}
              </p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'.5rem', background:'rgba(16,185,129,.08)',
                border:'1px solid rgba(16,185,129,.2)', borderRadius:'.75rem', padding:'.5rem 1rem' }}>
                <span className="live-dot" />
                <span style={{ fontSize:'.65rem', fontWeight:700, color:'#10b981', textTransform:'uppercase', letterSpacing:'.1em' }}>
                  Système opérationnel
                </span>
              </div>
              <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'.75rem',
                padding:'.5rem .9rem', fontSize:'.68rem', fontWeight:600, color:'var(--muted)' }}>
                🕐 {clock}
              </div>
            </div>
          </div>

          {/* ══════════ 1. VUE GLOBALE ══════════ */}
          {activeTab === 'vue-globale' && (
            <div className="page-anim">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
                <KpiCard accent="var(--red)" label="Stock total"
                  value={loading.stats ? '…' : (stats?.total_poches ?? 0)}
                  sub={<><TrendingUp size={10}/> Mis à jour en temps réel</>}
                  subColor="#10b981" note="Poches disponibles · tous produits" />
                <KpiCard accent="#f59e0b" label="Urgences actives"
                  value={loading.stats ? '…' : (stats?.urgences_actives ?? 0)}
                  sub="Action requise" subColor="#f59e0b" note="Alertes en cours" />
                <KpiCard accent="#eab308" label="Péremption ≤ 48h"
                  value={loading.stats ? '…' : (stats?.poches_perimees ?? 0)}
                  sub="Protocole FIFO actif" note="Poches à traiter en priorité" />
                <KpiCard accent="#3b82f6" label="Entrées / Sorties 24h"
                  value={loading.stats ? '…' : `+${stats?.entrees_24h ?? 0} / ${stats?.sorties_24h ?? 0}`}
                  sub="Flux du jour" subColor="#3b82f6" note="Entrées / Sorties" />
              </div>

              {/* Heatmap */}
              <Card style={{ marginTop:'1.5rem' }}>
                <CardPad style={{ borderBottom:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                    <div>
                      <div style={{ fontSize:'.7rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.1em' }}>
                        Indicateur de santé du stock
                      </div>
                      <div style={{ fontSize:'.85rem', fontWeight:700, marginTop:'.2rem' }}>Heatmap · CNHU-HKM</div>
                    </div>
                    <TabGroup
                      tabs={[{ id:'CGR', label:'CGR (Globules)' },{ id:'PFC', label:'PFC (Plasma)' },{ id:'CPA', label:'CPA (Plaquettes)' }]}
                      active={heatmapTab} onChange={setHeatmapTab}
                    />
                  </div>
                </CardPad>
                <CardPad>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:'.75rem' }}>
                    {['O−','O+','A−','A+','B−','B+','AB−','AB+'].map(g => {
                      const { status, badge } = bloodStatus(g);
                      return <BloodCell key={g} group={g} status={status} badge={badge} />;
                    })}
                  </div>
                  <div style={{ display:'flex', gap:'1.5rem', marginTop:'1.25rem', paddingTop:'1rem', borderTop:'1px solid var(--border)' }}>
                    {[
                      { color:'#ef4444', label:'< 5 unités — Urgence don', shadow:'rgba(239,68,68,.5)' },
                      { color:'#f59e0b', label:'5 – 15 unités — Vigilance' },
                      { color:'#10b981', label:'> 15 unités — Stable' },
                    ].map(l => (
                      <div key={l.label} style={{ display:'flex', alignItems:'center', gap:'.4rem', fontSize:'.62rem', color:'var(--muted)' }}>
                        <span style={{ width:8, height:8, borderRadius:'50%', background:l.color, boxShadow:l.shadow?`0 0 8px ${l.shadow}`:'none', display:'inline-block' }} />
                        {l.label}
                      </div>
                    ))}
                  </div>
                </CardPad>
              </Card>
            </div>
          )}

          {/* ══════════ 2. INVENTAIRE PRÉCIS ══════════ */}
          {activeTab === 'inventaire' && (
            <div className="page-anim">
              <Card>
                <CardPad style={{ borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                  <div>
                    <div style={{ fontSize:'.85rem', fontWeight:700 }}>Registre d'hémovigilance</div>
                    <div style={{ fontSize:'.65rem', color:'var(--muted)', marginTop:'.15rem', textTransform:'uppercase', letterSpacing:'.08em' }}>
                      Méthode FIFO · priorité péremption
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'.6rem', flexWrap:'wrap', alignItems:'center' }}>
                    <FSelect style={{ width:'auto', padding:'.5rem .9rem', fontSize:'.72rem' }}>
                      <option>Tous produits (CGR / PFC / CPA)</option>
                      <option>CGR — Globules Rouges</option>
                      <option>PFC — Plasma Frais Congelé</option>
                      <option>CPA — Concentré de Plaquettes</option>
                    </FSelect>
                    <FSelect style={{ width:'auto', padding:'.5rem .9rem', fontSize:'.72rem' }}>
                      <option>Statut : Tous</option>
                      <option>Disponible</option>
                      <option>En Analyse</option>
                      <option>Écarté</option>
                    </FSelect>
                    <div style={{ display:'flex', alignItems:'center', gap:'.5rem', background:'var(--glass)', border:'1px solid var(--border)', borderRadius:'.75rem', padding:'.5rem .9rem' }}>
                      <Search size={13} color="var(--muted)" />
                      <input value={searchTerm} onChange={e => setSearchTerm(e.target.value.toUpperCase())}
                        placeholder="ID Poche..." style={{ background:'transparent', border:'none', outline:'none', fontSize:'.72rem', color:'var(--text)', width:120, fontFamily:'DM Sans,sans-serif' }} />
                    </div>
                  </div>
                </CardPad>

                {loading.poches ? (
                  <CardPad style={{ textAlign:'center', color:'var(--muted)', fontSize:'.75rem' }}>
                    Chargement de l'inventaire…
                  </CardPad>
                ) : (
                  <TableWrap>
                    <thead>
                      <tr>
                        <Th>ID Poche</Th><Th>Type</Th><Th>Collecte</Th><Th>Péremption</Th>
                        <Th align="center">Groupe</Th><Th>Statut</Th><Th align="right">Action</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {poches.filter(p => p.code_barre?.includes(searchTerm)).map(p => {
                        const expired  = new Date(p.date_peremption) < new Date();
                        const isEcarte = p.status === 'Écarté' || p.status === 'ecarte';
                        const pillMap  = { 'Disponible':'ok', 'En Analyse':'warn', 'Écarté':'err', 'Sorti':'info' };
                        return (
                          <tr key={p.id}
                            style={isEcarte ? { background:'rgba(239,68,68,.04)' } : {}}
                            onMouseEnter={e => e.currentTarget.style.background = isEcarte ? 'rgba(239,68,68,.06)' : 'var(--glass)'}
                            onMouseLeave={e => e.currentTarget.style.background = isEcarte ? 'rgba(239,68,68,.04)' : 'transparent'}
                          >
                            <Td style={{ fontFamily:'Montserrat,sans-serif', fontSize:'.7rem', fontWeight:700, color:'#ff6b6b' }}>
                              {p.code_barre}
                            </Td>
                            <Td style={{ color:'var(--muted)', fontSize:'.72rem' }}>{p.type_produit}</Td>
                            <Td style={{ color:'var(--muted)', fontSize:'.72rem' }}>
                              {p.date_prelevement
                                ? new Date(p.date_prelevement).toLocaleDateString('fr-FR')
                                : '—'}
                            </Td>
                            <Td style={{ fontSize:'.72rem', color: expired ? '#ef4444' : 'inherit', fontWeight: expired ? 700 : 500 }}>
                              {new Date(p.date_peremption).toLocaleDateString('fr-FR')}
                            </Td>
                            <Td align="center">
                              <span style={{ background:'var(--glass2)', padding:'.2rem .6rem', borderRadius:'.4rem', fontWeight:800, fontSize:'.72rem', border:'1px solid var(--border)' }}>
                                {p.groupe}
                              </span>
                            </Td>
                            <Td><Pill variant={pillMap[p.status] || 'info'}>{p.status}</Pill></Td>
                            <Td align="right">
                              {isEcarte ? (
                                <Btn variant="red" style={{ padding:'.4rem .8rem', fontSize:'.68rem' }}
                                  onClick={() => handleDestroyPoche(p.id)}>
                                  🗑 Détruire
                                </Btn>
                              ) : (
                                <Btn variant="ghost" style={{ padding:'.4rem .8rem', fontSize:'.68rem',
                                  opacity: p.status === 'En Analyse' ? .4 : 1,
                                  cursor: p.status === 'En Analyse' ? 'not-allowed' : 'pointer' }}>
                                  Détails
                                </Btn>
                              )}
                            </Td>
                          </tr>
                        );
                      })}
                      {poches.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ padding:'2rem', textAlign:'center', color:'var(--muted)', fontSize:'.72rem' }}>
                            Aucune poche dans l'inventaire.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </TableWrap>
                )}

                <CardPad style={{ borderTop:'1px solid var(--border)', display:'flex', gap:'1.5rem', justifyContent:'center' }}>
                  {[['#10b981','Stock disponible'],['#f59e0b','En analyse'],['#ef4444','Protocole destruction']].map(([c,l]) => (
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:'.5rem', fontSize:'.62rem', color:'var(--muted)' }}>
                      <span style={{ width:7, height:7, borderRadius:'50%', background:c, display:'inline-block' }} /> {l}
                    </div>
                  ))}
                </CardPad>
              </Card>
            </div>
          )}

          {/* ══════════ 3. ALERTE SANG ══════════ */}
          {activeTab === 'urgence-sang' && (
            <div className="page-anim">
              <Card>
                <CardPad style={{ borderBottom:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'.85rem' }}>
                    <div style={{ width:38, height:38, background:'rgba(239,68,68,.15)', border:'1px solid rgba(239,68,68,.3)',
                      borderRadius:'.75rem', display:'flex', alignItems:'center', justifyContent:'center', color:'#ef4444' }}>
                      <Megaphone size={16}/>
                    </div>
                    <div>
                      <div style={{ fontSize:'.85rem', fontWeight:700 }}>Configuration de l'alerte de crise</div>
                      <div style={{ fontSize:'.65rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em', marginTop:'.15rem' }}>
                        Générez un visuel de mobilisation en 3 secondes
                      </div>
                    </div>
                  </div>
                </CardPad>
                <CardPad>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:'1rem', alignItems:'end' }}>
                    <div>
                      <FLabel color="#ef4444">1. Groupe critique</FLabel>
                      <FSelect value={alertCfg.groupe} onChange={e => setAlertCfg({...alertCfg, groupe:e.target.value})}>
                        <option>O− (Universel)</option><option>A−</option><option>B−</option><option>AB−</option>
                      </FSelect>
                    </div>
                    <div>
                      <FLabel>2. Centre hospitalier</FLabel>
                      <FInput value="CNHU-HKM (Cotonou)" readOnly style={{ opacity:.4, cursor:'not-allowed' }} />
                    </div>
                    <div>
                      <FLabel>3. Besoin (poches)</FLabel>
                      <FInput type="number" placeholder="Ex: 25" value={alertCfg.besoin}
                        onChange={e => setAlertCfg({...alertCfg, besoin:e.target.value})} />
                    </div>
                    <div>
                      {!showVisuel
                        ? <Btn onClick={handlePublishAlert} style={{ width:'100%', justifyContent:'center', padding:'.75rem 1rem' }}>
                            <Zap size={13}/> Générer
                          </Btn>
                        : <Btn variant="ghost" onClick={handleStopAlert} style={{ width:'100%', justifyContent:'center', padding:'.75rem 1rem', color:'#ef4444', borderColor:'rgba(239,68,68,.3)' }}>
                            <X size={13}/> Arrêter
                          </Btn>
                      }
                    </div>
                  </div>
                </CardPad>
              </Card>

              {!showVisuel ? (
                <Card style={{ marginTop:'1.5rem' }}>
                  <CardPad style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'3.5rem', textAlign:'center' }}>
                    <div style={{ width:56, height:56, background:'var(--glass)', borderRadius:'.85rem', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1rem' }}>
                      <Image size={22} color="var(--muted2)"/>
                    </div>
                    <div style={{ fontSize:'.72rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.1em' }}>
                      Le visuel d'urgence s'affichera ici
                    </div>
                  </CardPad>
                </Card>
              ) : (
                <div style={{ marginTop:'1.5rem' }}>
                  <AlertPoster ref={posterRef} groupe={alertCfg.groupe.split(' ')[0]} poches={alertCfg.besoin} />
                  <div style={{ display:'flex', gap:'.75rem', marginTop:'1.5rem', justifyContent:'center', flexWrap:'wrap' }}>
                    <button style={{ background:'#25D366', color:'#fff', border:'none', borderRadius:'.75rem', padding:'.75rem 1.5rem', fontSize:'.72rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:'.5rem' }}
                      onMouseEnter={e => e.currentTarget.style.opacity='.85'}
                      onMouseLeave={e => e.currentTarget.style.opacity='1'}
                    >📱 Partager WhatsApp</button>
                    <button style={{ background:'#1877F2', color:'#fff', border:'none', borderRadius:'.75rem', padding:'.75rem 1.5rem', fontSize:'.72rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:'.5rem' }}
                      onMouseEnter={e => e.currentTarget.style.opacity='.85'}
                      onMouseLeave={e => e.currentTarget.style.opacity='1'}
                    >📘 Publier Facebook</button>
                    <Btn variant="ghost" onClick={downloadPoster} style={{ fontSize:'.72rem' }}>⬇ Télécharger</Btn>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════ 4. ANALYSES ══════════ */}
          {activeTab === 'analyses' && (
            <div className="page-anim">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
                <KpiCard accent="#ef4444" label="Taux de péremption"
                  value="1.4%" sub={<Pill variant="err" style={{ fontSize:'.58rem' }}>−2% vs M−1</Pill>}
                  note="Objectif : tendre vers 0%" />
                <KpiCard accent="#10b981" label="Réactivité moyenne"
                  value={<>14.2<span style={{ fontSize:'.9rem' }}> min</span></>}
                  sub={<Pill variant="ok" style={{ fontSize:'.58rem' }}>FAST</Pill>}
                  note="Demande → livraison" />
                <KpiCard accent="#3b82f6" label="Volume mensuel distribué"
                  value={<>842<span style={{ fontSize:'.9rem' }}> poches</span></>}
                  note="Total sorties services" />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1rem', marginTop:'1.5rem' }}>
                <Card>
                  <CardPad style={{ borderBottom:'1px solid var(--border)' }}>
                    <div style={{ fontSize:'.82rem', fontWeight:700 }}>Consommation par groupe sanguin</div>
                  </CardPad>
                  <CardPad style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    {[
                      { label:'O+ (Universel Rec.)', pct:45 },
                      { label:'O− (Universel Don.)', pct:30 },
                      { label:'A+',                  pct:15, dim:true },
                      { label:'Autres groupes',       pct:10, dim:true },
                    ].map(r => (
                      <div key={r.label}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.72rem', fontWeight:600, marginBottom:'.4rem' }}>
                          <span>{r.label}</span><span style={{ fontWeight:800 }}>{r.pct}%</span>
                        </div>
                        <ProgressBar pct={r.pct} color={r.dim ? 'rgba(255,255,255,.25)' : 'var(--red)'} />
                      </div>
                    ))}
                  </CardPad>
                </Card>
                <Card>
                  <CardPad style={{ borderBottom:'1px solid var(--border)' }}>
                    <div style={{ fontSize:'.82rem', fontWeight:700 }}>Répartition par service hospitalier</div>
                  </CardPad>
                  <CardPad style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
                    {[
                      { s:'Urgences & Réanimation', v: stats?.sorties_24h ?? 312, accent:true },
                      { s:'Maternité (Gynéco)',      v:245 },
                      { s:'Bloc Chirurgical',        v:180 },
                      { s:'Hématologie',             v:105 },
                    ].map(r => (
                      <div key={r.s} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                        padding:'.75rem 1rem', background: r.accent ? 'rgba(157,2,8,.08)' : 'var(--glass)',
                        borderLeft: r.accent ? '3px solid var(--red)' : 'none',
                        borderRadius: r.accent ? '0 .6rem .6rem 0' : '.6rem' }}>
                        <span style={{ fontSize:'.75rem', fontWeight:600 }}>{r.s}</span>
                        <span style={{ fontSize:'.75rem', fontWeight:800, fontFamily:'Montserrat,sans-serif' }}>{r.v}</span>
                      </div>
                    ))}
                  </CardPad>
                </Card>
              </div>

              <div style={{ marginTop:'1.5rem', display:'flex', justifyContent:'flex-end' }}>
                <Btn><ChartLine size={13}/> Exporter le rapport mensuel d'activité</Btn>
              </div>
            </div>
          )}

          {/* ══════════ 5. BASE DONNEURS ══════════ */}
          {activeTab === 'donneurs' && (
            <div className="page-anim">
              <Card>
                <CardPad style={{ borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                  <div>
                    <div style={{ fontSize:'.85rem', fontWeight:700 }}>Base des donneurs volontaires</div>
                    <div style={{ fontSize:'.65rem', color:'var(--muted)', marginTop:'.15rem' }}>
                      Total : <strong style={{ color:'#10b981' }}>{donors.length}</strong> inscrits
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'.6rem', flexWrap:'wrap', alignItems:'center' }}>
                    <FSelect style={{ width:'auto', padding:'.5rem .9rem', fontSize:'.72rem' }}>
                      <option>Tous les groupes</option>
                      {['O−','O+','A−','A+','B−','B+'].map(g => <option key={g}>{g}</option>)}
                    </FSelect>
                    <FSelect style={{ width:'auto', padding:'.5rem .9rem', fontSize:'.72rem' }}>
                      <option>Toute localité</option>
                      {['Cotonou','Abomey-Calavi','Porto-Novo','Parakou'].map(v => <option key={v}>{v}</option>)}
                    </FSelect>
                    <FInput placeholder="Rechercher un nom..." style={{ width:180, padding:'.5rem .9rem', fontSize:'.72rem' }} />
                  </div>
                </CardPad>

                {loading.donors ? (
                  <CardPad style={{ textAlign:'center', color:'var(--muted)', fontSize:'.75rem' }}>
                    Chargement des donneurs…
                  </CardPad>
                ) : (
                  <TableWrap>
                    <thead>
                      <tr>
                        <Th>Nom complet</Th><Th align="center">Groupe</Th><Th>Localisation</Th>
                        <Th>WhatsApp</Th><Th>Dernier don</Th><Th align="right">Action</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {donors.map(d => {
                        const ini   = d.fullname?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '??';
                        const isNeg = d.blood_group?.includes('-') || d.blood_group?.includes('−');
                        return (
                          <tr key={d.id}
                            onMouseEnter={e => e.currentTarget.style.background='var(--glass)'}
                            onMouseLeave={e => e.currentTarget.style.background='transparent'}
                          >
                            <Td>
                              <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                                <div style={{ width:32, height:32, borderRadius:'.5rem', background:'rgba(157,2,8,.15)',
                                  display:'flex', alignItems:'center', justifyContent:'center',
                                  fontSize:'.65rem', fontWeight:800, color:'#ff6b6b', flexShrink:0 }}>
                                  {ini}
                                </div>
                                <span style={{ fontWeight:600 }}>{d.fullname}</span>
                              </div>
                            </Td>
                            <Td align="center">
                              <span style={{ background: isNeg ? 'rgba(239,68,68,.1)' : 'var(--glass2)',
                                color: isNeg ? '#ef4444' : 'var(--text)', padding:'.2rem .55rem',
                                borderRadius:'.4rem', fontWeight:800, fontSize:'.7rem',
                                border: isNeg ? '1px solid rgba(239,68,68,.2)' : '1px solid var(--border)' }}>
                                {d.blood_group}
                              </span>
                            </Td>
                            <Td style={{ color:'var(--muted)', fontSize:'.72rem' }}>📍 {d.city}</Td>
                            <Td style={{ color:'#10b981', fontSize:'.75rem', fontWeight:600 }}>{d.phone}</Td>
                            <Td style={{ color:'var(--muted)', fontSize:'.72rem', fontStyle: d.last_donation_date ? 'normal' : 'italic' }}>
                              {d.last_donation_date
                                ? new Date(d.last_donation_date).toLocaleDateString('fr-FR')
                                : 'Jamais'}
                            </Td>
                            <Td align="right">
                              <div style={{ display:'flex', gap:'.4rem', justifyContent:'flex-end' }}>
                                {d.status !== 'verified' && (
                                  <button onClick={() => updateDonorStatus(d.id,'verified')}
                                    style={{ padding:'.35rem .8rem', borderRadius:'.5rem', fontSize:'.65rem', fontWeight:700,
                                      background:'rgba(16,185,129,.1)', color:'#10b981', border:'1px solid rgba(16,185,129,.2)',
                                      cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'.35rem', transition:'background .2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background='rgba(16,185,129,.25)'}
                                    onMouseLeave={e => e.currentTarget.style.background='rgba(16,185,129,.1)'}
                                  >
                                    <CheckCircle2 size={12}/> Valider
                                  </button>
                                )}
                                <a href={`https://wa.me/${d.phone?.replace(/\s/g,'').replace('+','')}`}
                                  target="_blank" rel="noreferrer"
                                  style={{ padding:'.35rem .8rem', borderRadius:'.5rem', fontSize:'.65rem', fontWeight:700,
                                    background:'rgba(16,185,129,.1)', color:'#10b981', border:'1px solid rgba(16,185,129,.2)',
                                    textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'.35rem', transition:'background .2s' }}
                                  onMouseEnter={e => e.currentTarget.style.background='rgba(16,185,129,.25)'}
                                  onMouseLeave={e => e.currentTarget.style.background='rgba(16,185,129,.1)'}
                                >
                                  📱 Contacter
                                </a>
                              </div>
                            </Td>
                          </tr>
                        );
                      })}
                      {donors.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ padding:'2rem', textAlign:'center', color:'var(--muted)', fontSize:'.72rem' }}>
                            Aucun donneur enregistré.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </TableWrap>
                )}
              </Card>
            </div>
          )}

        </main>
      </div>

      {/* ════════════ MODAL CNTS ════════════ */}
      {isModalOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
          <div onClick={() => setIsModalOpen(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.85)', backdropFilter:'blur(8px)' }} />
          <div style={{ position:'relative', zIndex:1, background:'var(--bg2)', border:'1px solid var(--border)',
            borderRadius:'1.5rem', padding:'2rem', width:'100%', maxWidth:480, boxShadow:'0 40px 80px rgba(0,0,0,.5)', animation:'fadeUp .3s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
              <div>
                <div style={{ fontSize:'1.1rem', fontWeight:800, letterSpacing:'-.02em' }}>
                  Liaison <span style={{ color:'#ef4444' }}>CNTS</span>
                </div>
                <div style={{ fontSize:'.63rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.1em', marginTop:'.2rem' }}>
                  Protocole d'urgence hémovigilance
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ width:32, height:32, borderRadius:'.6rem',
                background:'var(--glass)', border:'1px solid var(--border)', color:'var(--muted)',
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,.2)'; e.currentTarget.style.color='#ef4444'; }}
                onMouseLeave={e => { e.currentTarget.style.background='var(--glass)'; e.currentTarget.style.color='var(--muted)'; }}
              >✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div>
                <FLabel>1. Nature du produit</FLabel>
                <FSelect>
                  <option>Choisir le produit...</option>
                  <option>CGR — Concentré de Globules Rouges</option>
                  <option>PFC — Plasma Frais Congelé</option>
                  <option>CPA — Concentré de Plaquettes</option>
                </FSelect>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                <div>
                  <FLabel>2. Groupe sanguin</FLabel>
                  <FSelect>
                    <option>—</option>
                    {['O−','O+','A−','A+','B−','B+','AB−','AB+'].map(g => <option key={g}>{g}</option>)}
                  </FSelect>
                </div>
                <div>
                  <FLabel>3. Quantité (poches)</FLabel>
                  <FInput type="number" min="1" placeholder="Nb de poches" />
                </div>
              </div>
              <Btn onClick={() => { notify('Signal transmis au régulateur CNTS Bénin.'); setIsModalOpen(false); }}
                style={{ width:'100%', justifyContent:'center', padding:'1rem', fontSize:'.78rem', marginTop:'.5rem' }}>
                <Send size={14} color="#86efac"/> Transmettre l'alerte au régulateur
              </Btn>
            </div>
          </div>
        </div>
      )}

      <Toast notif={notif} />
    </>
  );
};

export default AdminDash;