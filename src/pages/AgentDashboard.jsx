import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://sang-vie-back-rfmj.onrender.com/api';

const BLOOD_GROUPS  = ['O−','O+','A−','A+','B−','B+','AB−','AB+'];
const TYPES_PRODUIT = ['CGR — Globules Rouges','PFC — Plasma Frais Congelé','CPA — Concentré de Plaquettes'];
const SERVICES      = ['Urgences & Réanimation','Maternité — Gynécologie','Bloc opératoire','Hématologie','Pédiatrie'];
const MOTIFS_REBUT  = ['Péremption dépassée','Poche percée / accident','Test sérologique positif','Problème de conservation','Autre'];

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}` }
});

/* ─── helpers UI ─── */
const cellCls    = { ok:'bg-emerald-500/[.08] border border-emerald-500/20', warn:'bg-amber-500/[.08] border border-amber-500/20', crit:'bg-red-500/[.10] border-2 border-red-500/40' };
const cellLblCls = { ok:'text-emerald-400', warn:'text-amber-400', crit:'text-red-400' };
const cellLbl    = { ok:'Stable', warn:'Vigilance', crit:'Critique' };

const groupeBadge = (g) => {
  const neg = g?.includes('−') || g?.includes('-');
  const display = g?.replace('-', '−');
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${neg ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-white/80 border-white/10'}`}>
      {display}
    </span>
  );
};

/* Calcule le statut d'une poche selon sa date de péremption */
const getPocheUrgency = (datePeremption) => {
  const diff = (new Date(datePeremption) - new Date()) / (1000 * 60 * 60 * 24);
  if (diff < 0)  return { label:'Périmée',     cls:'bg-red-500/20 text-red-300 border-red-500/30',    dot:'bg-red-400' };
  if (diff <= 2) return { label:'≤ 2 jours',   cls:'bg-red-500/10 text-red-400 border-red-500/20',    dot:'bg-red-400 animate-pulse' };
  if (diff <= 7) return { label:'≤ 7 jours',   cls:'bg-amber-500/10 text-amber-400 border-amber-500/20', dot:'bg-amber-400' };
  return              { label:'OK',             cls:'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot:'bg-emerald-400' };
};

const inputCls = 'w-full bg-white/[.04] border border-white/[.07] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500/50 focus:bg-white/[.07] transition-all';
const labelCls = 'block text-[10px] font-black uppercase tracking-[.12em] text-white/30 mb-1.5';
const thCls    = 'px-4 py-3 text-left text-[9px] font-black uppercase tracking-[.12em] text-white/30 border-b border-white/[.06]';
const tdCls    = 'px-4 py-3 text-[11px] font-medium border-b border-white/[.03]';

const KpiCard = ({ accent, label, value, sub, subColor, note }) => (
  <div className="relative bg-white/[.04] border border-white/[.07] rounded-2xl p-5 overflow-hidden hover:border-white/[.12] transition-all">
    <div className="absolute top-0 left-0 w-[3px] h-full rounded-l-2xl" style={{ background: accent }} />
    <div className="text-[10px] font-black uppercase tracking-[.12em] text-white/30 mb-1">{label}</div>
    <div className="font-black text-3xl leading-none mb-1" style={{ fontFamily:"'Montserrat',sans-serif", color: subColor || '#f1f5f9' }}>{value}</div>
    <div className="text-[11px] font-semibold" style={{ color: subColor || 'rgba(255,255,255,.35)' }}>{sub}</div>
    {note && <div className="text-[10px] text-white/20 mt-1">{note}</div>}
  </div>
);

const AlertStrip = ({ type, icon, children }) => (
  <div className={`flex items-start gap-3 rounded-xl px-4 py-3 text-xs font-medium ${type === 'crit' ? 'bg-red-500/[.08] border border-red-500/20 text-red-300' : 'bg-amber-500/[.06] border border-amber-500/15 text-amber-300'}`}>
    <i className={`fa-solid ${icon} mt-0.5 flex-shrink-0`} />
    <div>{children}</div>
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white/[.04] border border-white/[.07] rounded-2xl overflow-hidden ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => (
  <div className="px-5 py-4 border-b border-white/[.06] flex items-center justify-between flex-wrap gap-3">{children}</div>
);

const HeatCell = ({ group, status, count }) => (
  <div className={`rounded-xl p-3 text-center ${cellCls[status]}`}>
    {status === 'crit' && count > 0 && (
      <div className="flex justify-end mb-1">
        <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,.6)]">{count}</span>
      </div>
    )}
    <div className="font-black text-white text-lg leading-none" style={{ fontFamily:"'Montserrat',sans-serif" }}>{group}</div>
    <div className={`text-[8px] font-black uppercase mt-1 ${cellLblCls[status]}`}>{cellLbl[status]}</div>
  </div>
);

const TabGroup = ({ tabs, active, onChange }) => (
  <div className="flex bg-white/[.04] border border-white/[.07] rounded-xl p-0.5">
    {tabs.map((t) => (
      <button key={t} onClick={() => onChange(t)}
        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${active === t ? 'bg-red-700 text-white shadow' : 'text-white/40 hover:text-white'}`}>
        {t}
      </button>
    ))}
  </div>
);

const Spinner = () => (
  <div className="flex items-center justify-center py-12">
    <i className="fa-solid fa-circle-notch fa-spin text-white/30 text-xl" />
  </div>
);

/* ─────────────────────────────────────────────
   PANEL LATÉRAL — slide-in depuis la droite
   ───────────────────────────────────────────── */
const SlidePanel = ({ open, onClose, title, subtitle, accentColor = '#9d0208', children }) => (
  <>
    {/* Overlay */}
    {open && (
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    )}
    {/* Panel */}
    <div
      className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out"
      style={{
        width: 440,
        background: '#0d1117',
        borderLeft: '1px solid rgba(255,255,255,.08)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
      }}
    >
      {/* Header panel */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[.07]"
        style={{ borderTop: `3px solid ${accentColor}` }}>
        <div>
          <h2 className="font-black text-base text-white" style={{ fontFamily:"'Montserrat',sans-serif" }}>{title}</h2>
          <p className="text-[10px] text-white/30 uppercase tracking-[.1em] mt-0.5">{subtitle}</p>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[.08] transition">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {children}
      </div>
    </div>
  </>
);

/* ─────────────────────────────────────────────
   SECTION 1 — Tableau de bord
   ───────────────────────────────────────────── */
const SectionAccueil = () => {
  const [heatTab, setHeatTab]   = useState('CGR');
  const [kpis, setKpis]         = useState(null);
  const [heatmap, setHeatmap]   = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [conso, setConso]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    axios.get(`${API}/dashboard`, authHeaders())
      .then(r => {
        setKpis(r.data.stats);
        setHeatmap(r.data.heatmap);
        setTimeline(r.data.timeline);
        setConso(r.data.conso);
      })
      .catch(e => console.error('Dashboard:', e.response?.status))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      {heatmap.filter(h => h.status === 'crit').map(h => (
        <AlertStrip key={h.group} type="crit" icon="fa-triangle-exclamation">
          <strong className="font-black">{h.group} Critique</strong> — {h.count} poche{h.count > 1 ? 's' : ''} restante{h.count > 1 ? 's' : ''}. Réapprovisionnement requis.
        </AlertStrip>
      ))}
      {kpis?.peremption_24h > 0 && (
        <AlertStrip type="warn" icon="fa-hourglass-half">
          <strong className="font-black">Péremption imminente</strong> — {kpis.peremption_24h} poches expirent dans moins de 24h. Prioriser en FIFO.
        </AlertStrip>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard accent="#9d0208" label="Stock total"            value={kpis?.stock_total      ?? '—'} sub={kpis?.stock_evolution ?? ''} subColor="#10b981" note="Poches · tous produits" />
        <KpiCard accent="#ef4444" label="Urgences actives"       value={kpis?.urgences_actives ?? '—'} sub="Action requise"              subColor="#ef4444" note="Demandes non traitées"  />
        <KpiCard accent="#f59e0b" label="Péremption ≤ 24h"       value={kpis?.peremption_24h   ?? '—'} sub="Protocole FIFO actif"        subColor="#f59e0b" note="Poches à prioriser"     />
        <KpiCard accent="#10b981" label="Qualifiées aujourd'hui" value={kpis?.qualifiees_jour  ?? '—'} sub="Validées labo"               subColor="#10b981" note="Injectées au stock"     />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[.1em] text-white/30">Indicateur de santé</div>
              <div className="text-sm font-bold mt-0.5">Heatmap · CNHU-HKM</div>
            </div>
            <TabGroup tabs={['CGR','PFC','CPA']} active={heatTab} onChange={setHeatTab} />
          </CardHeader>
          <div className="p-5">
            <div className="grid grid-cols-4 gap-2">
              {heatmap.map((d) => <HeatCell key={d.group} {...d} />)}
            </div>
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/[.06]">
              {[['#ef4444','< 5 — Urgence'],['#f59e0b','5–15 — Vigilance'],['#10b981','> 15 — Stable']].map(([c,l]) => (
                <span key={l} className="flex items-center gap-1.5 text-[10px] text-white/30">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:c }} />{l}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[.1em] text-white/30">Traçabilité temps réel</div>
              <div className="text-sm font-bold mt-0.5">Activité de votre poste</div>
            </div>
          </CardHeader>
          <div className="p-5 space-y-1">
            {timeline.length === 0
              ? <p className="text-[11px] text-white/20 text-center py-4">Aucune activité aujourd'hui.</p>
              : timeline.map((t, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/[.04] last:border-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: t.bg }}>
                    <i className={`fa-solid ${t.icon} text-[11px]`} style={{ color: t.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-white truncate">{t.title}</div>
                    <div className="text-[10px] text-white/30 mt-0.5">{t.sub}</div>
                  </div>
                  <span className="text-[10px] text-white/20 font-mono flex-shrink-0">{t.time}</span>
                </div>
              ))
            }
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[.1em] text-white/30">Sorties du jour</div>
            <div className="text-sm font-bold mt-0.5">Consommation par service hospitalier</div>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Mis à jour</span>
        </CardHeader>
        <div className="p-5 space-y-4">
          {conso.length === 0
            ? <p className="text-[11px] text-white/20 text-center py-4">Aucune sortie enregistrée.</p>
            : conso.map(({ label, val, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-[11px] font-semibold mb-1.5">
                  <span className="text-white/70">{label}</span>
                  <span className="font-black text-white">{val}</span>
                </div>
                <div className="h-1.5 bg-white/[.05] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background: color }} />
                </div>
              </div>
            ))
          }
        </div>
      </Card>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SECTION 2 — Réception
   ───────────────────────────────────────────── */
const SectionReception = ({ toast }) => {
  const [form, setForm]       = useState({ code_barre:'', type_produit:'CGR — Globules Rouges', groupe:'O−', date_prelevement:'', date_peremption:'' });
  const [poches, setPoches]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const fetchPoches = async () => {
    try {
      const r = await axios.get(`${API}/poches?status=Disponible`, authHeaders());
      setPoches(r.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchPoches(); }, []);

  const handleSubmit = async () => {
    if (!form.code_barre || !form.date_prelevement || !form.date_peremption) {
      toast('Veuillez remplir tous les champs obligatoires.'); return;
    }
    setSaving(true);
    try {
      await axios.post(`${API}/poches`, {
        code_barre:       form.code_barre,
        type_produit:     form.type_produit.split(' ')[0],
        groupe:           form.groupe,
        date_prelevement: form.date_prelevement,
        date_peremption:  form.date_peremption,
      }, authHeaders());
      toast('Poche enregistrée et injectée au stock.');
      setForm({ code_barre:'', type_produit:'CGR — Globules Rouges', groupe:'O−', date_prelevement:'', date_peremption:'' });
      fetchPoches();
    } catch(err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors)[0][0]
        : "Erreur lors de l'enregistrement.";
      toast(msg);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[.1em] text-white/30">Opération stock</div>
            <div className="text-sm font-bold mt-0.5">Réception & Enregistrement d'une poche</div>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">FIFO</span>
        </CardHeader>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelCls} style={{ color:'#10b981' }}>ID Poche (scanner)</label>
              <input name="code_barre" value={form.code_barre} onChange={onChange} placeholder="SV-BJ-2026-XXXX"
                className={inputCls} style={{ color:'#ff6b6b', fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:'.72rem' }} />
            </div>
            <div>
              <label className={labelCls}>Type de produit</label>
              <select name="type_produit" value={form.type_produit} onChange={onChange} className={inputCls} style={{ appearance:'none' }}>
                {TYPES_PRODUIT.map(t => <option key={t} className="bg-slate-900">{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Groupe sanguin</label>
              <select name="groupe" value={form.groupe} onChange={onChange} className={inputCls} style={{ appearance:'none', color:'#ff6b6b', fontWeight:700 }}>
                {BLOOD_GROUPS.map(g => <option key={g} className="bg-slate-900">{g}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Date de collecte</label>
              <input type="date" name="date_prelevement" value={form.date_prelevement} onChange={onChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Date de péremption</label>
              <input type="date" name="date_peremption" value={form.date_peremption} onChange={onChange} className={inputCls} />
            </div>
          </div>
          <button onClick={handleSubmit} disabled={saving}
            className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-[.1em] transition flex items-center justify-center gap-2">
            {saving ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-circle-check" />}
            {saving ? 'Enregistrement...' : 'Confirmer & injecter au stock'}
          </button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-bold">Poches disponibles en stock</div>
          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {loading ? '...' : `${poches.length} poches`}
          </span>
        </CardHeader>
        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>{['ID Poche','Type','Groupe','Collecte','Péremption'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
              <tbody>
                {poches.length === 0
                  ? <tr><td colSpan={5} className="text-center text-white/20 text-xs py-6">Aucune poche disponible.</td></tr>
                  : poches.map(r => (
                    <tr key={r.id} className="hover:bg-white/[.02] transition">
                      <td className={`${tdCls} font-bold text-red-400 font-mono text-[10px]`}>{r.code_barre}</td>
                      <td className={`${tdCls} text-white/40`}>{r.type_produit}</td>
                      <td className={tdCls}>{groupeBadge(r.groupe)}</td>
                      <td className={`${tdCls} text-white/40`}>{r.date_prelevement}</td>
                      <td className={`${tdCls} text-amber-400 font-bold`}>{r.date_peremption}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SECTION 3 — Guichet Sortie
   Flow : liste des poches → clic → panel auto-rempli → valider
   ───────────────────────────────────────────── */
const SectionSortie = ({ toast }) => {
  const [poches, setPoches]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null); // poche choisie
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ service:'Urgences & Réanimation', degre_urgence:'vitale', patient_nom:'', prescripteur:'' });

  const fetchPoches = async () => {
    try {
      const r = await axios.get(`${API}/poches?status=Disponible`, authHeaders());
      setPoches(r.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchPoches(); }, []);

  const handleSelect = (poche) => {
    setSelected(poche);
    setForm({ service:'Urgences & Réanimation', degre_urgence:'vitale', patient_nom:'', prescripteur:'' });
    setPanelOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.patient_nom) { toast('Le nom du patient est obligatoire.'); return; }
    setSaving(true);
    try {
      await axios.post(`${API}/poches/${selected.id}/sortie`, {
        service_destinataire: form.service,
        motif_sortie: `Transfusion — ${form.patient_nom}${form.prescripteur ? ' — Dr. ' + form.prescripteur : ''} — Urgence ${form.degre_urgence}`,
      }, authHeaders());
      toast(`Sortie validée · Poche ${selected.code_barre} livrée à ${form.service}.`);
      setPanelOpen(false);
      setSelected(null);
      fetchPoches();
    } catch(err) {
      console.error(err.response?.data);
      toast('Erreur lors de la validation.');
    } finally { setSaving(false); }
  };

  const filtered = poches.filter(p =>
    p.code_barre?.toLowerCase().includes(search.toLowerCase()) ||
    p.groupe?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="space-y-4">
        {/* Instructions */}
        <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-xs font-medium bg-blue-500/[.06] border border-blue-500/15 text-blue-300">
          <i className="fa-solid fa-circle-info mt-0.5 flex-shrink-0" />
          <div>Sélectionnez une poche dans la liste ci-dessous. Le formulaire de sortie s'ouvrira automatiquement pour compléter les détails.</div>
        </div>

        <Card>
          <CardHeader>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[.1em] text-white/30">Stock disponible</div>
              <div className="text-sm font-bold mt-0.5">Sélectionner une poche à sortir</div>
            </div>
            {/* Recherche */}
            <div className="flex items-center gap-2 bg-white/[.04] border border-white/[.07] rounded-xl px-3 py-2">
              <i className="fa-solid fa-magnifying-glass text-white/30 text-[11px]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par ID ou groupe..."
                className="bg-transparent outline-none text-[11px] text-white placeholder:text-white/20 w-48"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-white/20 hover:text-white transition">
                  <i className="fa-solid fa-xmark text-[10px]" />
                </button>
              )}
            </div>
          </CardHeader>

          {loading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={thCls}>ID Poche</th>
                    <th className={thCls}>Type</th>
                    <th className={thCls}>Groupe</th>
                    <th className={thCls}>Péremption</th>
                    <th className={thCls}>État</th>
                    <th className={`${thCls} text-right`}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-white/20 text-xs py-8">
                        {search ? `Aucune poche correspondant à "${search}"` : 'Aucune poche disponible.'}
                      </td>
                    </tr>
                  ) : filtered.map(p => {
                    const urgency = getPocheUrgency(p.date_peremption);
                    const isSelected = selected?.id === p.id && panelOpen;
                    return (
                      <tr key={p.id}
                        className={`transition ${isSelected ? 'bg-blue-500/[.08]' : 'hover:bg-white/[.02]'}`}>
                        <td className={`${tdCls} font-bold text-red-400 font-mono text-[10px]`}>{p.code_barre}</td>
                        <td className={`${tdCls} text-white/50 text-[11px]`}>{p.type_produit}</td>
                        <td className={tdCls}>{groupeBadge(p.groupe)}</td>
                        <td className={`${tdCls} text-[11px] text-white/60`}>{p.date_peremption}</td>
                        <td className={tdCls}>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black border ${urgency.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${urgency.dot}`} />
                            {urgency.label}
                          </span>
                        </td>
                        <td className={`${tdCls} text-right`}>
                          <button
                            onClick={() => handleSelect(p)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition border ${
                              isSelected
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : 'bg-white/[.04] text-white/60 border-white/[.07] hover:bg-red-700/20 hover:text-red-300 hover:border-red-700/30'
                            }`}
                          >
                            <i className={`fa-solid ${isSelected ? 'fa-check' : 'fa-truck-fast'} text-[9px]`} />
                            {isSelected ? 'Sélectionnée' : 'Sortir'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Panel latéral sortie */}
      <SlidePanel
        open={panelOpen}
        onClose={() => { setPanelOpen(false); setSelected(null); }}
        title="Valider la sortie"
        subtitle="Livraison au service · hémovigilance"
        accentColor="#9d0208"
      >
        {selected && (
          <>
            {/* Récap poche sélectionnée */}
            <div className="bg-white/[.03] border border-white/[.07] rounded-xl p-4">
              <div className="text-[9px] font-black uppercase tracking-[.12em] text-white/30 mb-2">Poche sélectionnée</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-red-400 text-sm">{selected.code_barre}</div>
                  <div className="text-[11px] text-white/50 mt-0.5">{selected.type_produit} · Péremption : {selected.date_peremption}</div>
                </div>
                {groupeBadge(selected.groupe)}
              </div>
            </div>

            {/* Formulaire */}
            <div>
              <label className={labelCls}>Service demandeur</label>
              <select value={form.service} onChange={e => setForm(p => ({...p, service:e.target.value}))} className={inputCls} style={{ appearance:'none' }}>
                {SERVICES.map(s => <option key={s} className="bg-slate-900">{s}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls} style={{ color:'#ef4444' }}>Degré d'urgence</label>
              <div className="grid grid-cols-2 gap-2">
                {['vitale','relative'].map(d => (
                  <button key={d} onClick={() => setForm(p => ({...p, degre_urgence:d}))}
                    className={`py-3 rounded-xl text-[11px] font-bold border transition ${
                      form.degre_urgence === d
                        ? d === 'vitale'
                          ? 'bg-red-700/20 text-red-300 border-red-700/40'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-white/[.03] text-white/40 border-white/[.07] hover:bg-white/[.06]'
                    }`}>
                    <i className={`fa-solid ${d === 'vitale' ? 'fa-bolt' : 'fa-clock'} mr-1.5`} />
                    {d === 'vitale' ? 'Vitale' : 'Relative'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Nom du patient <span className="text-red-500">*</span></label>
              <input
                value={form.patient_nom}
                onChange={e => setForm(p => ({...p, patient_nom:e.target.value}))}
                placeholder="NOM PRÉNOM du patient"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Prescripteur (optionnel)</label>
              <input
                value={form.prescripteur}
                onChange={e => setForm(p => ({...p, prescripteur:e.target.value}))}
                placeholder="Dr. NOM Prénom"
                className={inputCls}
              />
            </div>

            {/* Bouton validation */}
            <button onClick={handleSubmit} disabled={saving}
              className="w-full py-4 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-[.12em] hover:bg-gray-100 disabled:opacity-50 transition flex items-center justify-center gap-2 mt-2">
              {saving ? <i className="fa-solid fa-circle-notch fa-spin text-slate-900" /> : <i className="fa-solid fa-flag-checkered" />}
              {saving ? 'Validation...' : 'Confirmer la sortie'}
            </button>
          </>
        )}
      </SlidePanel>
    </>
  );
};

/* ─────────────────────────────────────────────
   SECTION 4 — Mise au rebut
   Flow : liste des poches → clic → panel auto-rempli → motif → confirmer
   ───────────────────────────────────────────── */
const SectionPertes = ({ toast }) => {
  const [poches, setPoches]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterExp, setFilterExp] = useState(false); // filtre périmées / proches péremption
  const [selected, setSelected]   = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ motif:'Péremption dépassée', observations:'' });

  const fetchPoches = async () => {
    try {
      const r = await axios.get(`${API}/poches?status=Disponible`, authHeaders());
      setPoches(r.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchPoches(); }, []);

  const handleSelect = (poche) => {
    setSelected(poche);
    // Auto-suggère le motif selon l'urgence
    const urgency = getPocheUrgency(poche.date_peremption);
    setForm({
      motif: urgency.label === 'Périmée' || urgency.label === '≤ 2 jours'
        ? 'Péremption dépassée'
        : 'Poche percée / accident',
      observations: '',
    });
    setPanelOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/poches/${selected.id}/sortie`, {
        service_destinataire: 'DESTRUCTION',
        motif_sortie: `Péremption / Destruction — ${form.motif}${form.observations ? ' — ' + form.observations : ''}`,
      }, authHeaders());
      toast(`Destruction enregistrée · Poche ${selected.code_barre} retirée du stock.`);
      setPanelOpen(false);
      setSelected(null);
      fetchPoches();
    } catch(err) {
      toast("Erreur lors de l'enregistrement.");
    } finally { setSaving(false); }
  };

  const filtered = poches
    .filter(p =>
      p.code_barre?.toLowerCase().includes(search.toLowerCase()) ||
      p.groupe?.toLowerCase().includes(search.toLowerCase())
    )
    .filter(p => {
      if (!filterExp) return true;
      const diff = (new Date(p.date_peremption) - new Date()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    })
    // Trie les périmées / proches en premier
    .sort((a, b) => new Date(a.date_peremption) - new Date(b.date_peremption));

  const countExpiring = poches.filter(p => {
    const diff = (new Date(p.date_peremption) - new Date()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  return (
    <>
      <div className="space-y-4">
        <AlertStrip type="warn" icon="fa-triangle-exclamation">
          Toute destruction est <strong className="font-black">irréversible</strong>. Sélectionnez la poche à détruire dans la liste. Votre visa sera apposé automatiquement.
        </AlertStrip>

        <Card>
          <CardHeader>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[.1em] text-white/30">Stock disponible</div>
              <div className="text-sm font-bold mt-0.5">Sélectionner une poche à détruire</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filtre péremption */}
              <button
                onClick={() => setFilterExp(v => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                  filterExp
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-white/[.04] text-white/50 border-white/[.07] hover:text-white'
                }`}
              >
                <i className="fa-solid fa-hourglass-half text-[9px]" />
                Expirent bientôt
                {countExpiring > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500/30 text-amber-300 text-[8px] font-black flex items-center justify-center">
                    {countExpiring}
                  </span>
                )}
              </button>
              {/* Recherche */}
              <div className="flex items-center gap-2 bg-white/[.04] border border-white/[.07] rounded-xl px-3 py-2">
                <i className="fa-solid fa-magnifying-glass text-white/30 text-[11px]" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ID ou groupe..."
                  className="bg-transparent outline-none text-[11px] text-white placeholder:text-white/20 w-36"
                />
              </div>
            </div>
          </CardHeader>

          {loading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={thCls}>ID Poche</th>
                    <th className={thCls}>Type</th>
                    <th className={thCls}>Groupe</th>
                    <th className={thCls}>Péremption</th>
                    <th className={thCls}>État</th>
                    <th className={`${thCls} text-right`}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-white/20 text-xs py-8">
                        Aucune poche trouvée.
                      </td>
                    </tr>
                  ) : filtered.map(p => {
                    const urgency = getPocheUrgency(p.date_peremption);
                    const isSelected = selected?.id === p.id && panelOpen;
                    return (
                      <tr key={p.id}
                        className={`transition ${isSelected ? 'bg-amber-500/[.05]' : 'hover:bg-white/[.02]'}`}>
                        <td className={`${tdCls} font-bold text-red-400 font-mono text-[10px]`}>{p.code_barre}</td>
                        <td className={`${tdCls} text-white/50 text-[11px]`}>{p.type_produit}</td>
                        <td className={tdCls}>{groupeBadge(p.groupe)}</td>
                        <td className={`${tdCls} text-[11px] text-white/60`}>{p.date_peremption}</td>
                        <td className={tdCls}>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black border ${urgency.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${urgency.dot}`} />
                            {urgency.label}
                          </span>
                        </td>
                        <td className={`${tdCls} text-right`}>
                          <button
                            onClick={() => handleSelect(p)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition border ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-white/[.04] text-white/60 border-white/[.07] hover:bg-red-700/20 hover:text-red-300 hover:border-red-700/30'
                            }`}
                          >
                            <i className={`fa-solid ${isSelected ? 'fa-check' : 'fa-radiation'} text-[9px]`} />
                            {isSelected ? 'Sélectionnée' : 'Détruire'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Panel latéral rebut */}
      <SlidePanel
        open={panelOpen}
        onClose={() => { setPanelOpen(false); setSelected(null); }}
        title="Confirmer la destruction"
        subtitle="Mise au rebut · traçabilité hémovigilance"
        accentColor="#f59e0b"
      >
        {selected && (
          <>
            {/* Récap poche */}
            <div className="bg-amber-500/[.05] border border-amber-500/15 rounded-xl p-4">
              <div className="text-[9px] font-black uppercase tracking-[.12em] text-amber-400/60 mb-2">Poche à détruire</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-amber-400 text-sm">{selected.code_barre}</div>
                  <div className="text-[11px] text-white/50 mt-0.5">{selected.type_produit} · Péremption : {selected.date_peremption}</div>
                </div>
                {groupeBadge(selected.groupe)}
              </div>
              {/* Indicateur urgence */}
              {(() => {
                const u = getPocheUrgency(selected.date_peremption);
                return (
                  <div className={`mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black border ${u.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.dot}`} />
                    {u.label}
                  </div>
                );
              })()}
            </div>

            <div>
              <label className={labelCls}>Motif de destruction</label>
              <select value={form.motif} onChange={e => setForm(p => ({...p, motif:e.target.value}))} className={inputCls} style={{ appearance:'none' }}>
                {MOTIFS_REBUT.map(m => <option key={m} className="bg-slate-900">{m}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Observations (optionnel)</label>
              <input value={form.observations} onChange={e => setForm(p => ({...p, observations:e.target.value}))}
                placeholder="Précisions supplémentaires..." className={inputCls} />
            </div>

            {/* Note traçabilité */}
            <div className="bg-white/[.03] border border-white/[.06] rounded-xl px-4 py-3">
              <div className="text-[9px] font-black uppercase tracking-[.1em] text-white/30 mb-1">
                <i className="fa-solid fa-shield-halved mr-1.5 text-amber-400" />Traçabilité assurée
              </div>
              <p className="text-[11px] text-white/30 leading-relaxed">
                Votre visa sera automatiquement apposé avec l'horodatage sur le registre des pertes.
              </p>
            </div>

            {/* Bouton confirmation — style différent pour souligner l'irréversibilité */}
            <button onClick={handleSubmit} disabled={saving}
              className="w-full py-4 bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:bg-amber-500/20 disabled:opacity-50 rounded-xl font-black text-xs uppercase tracking-[.1em] transition flex items-center justify-center gap-2">
              {saving ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-biohazard" />}
              {saving ? 'Enregistrement...' : 'Confirmer la destruction irréversible'}
            </button>
          </>
        )}
      </SlidePanel>
    </>
  );
};

/* ─────────────────────────────────────────────
   SECTIONS REGISTRES
   ───────────────────────────────────────────── */
const SectionRegEntrees = () => {
  const [poches, setPoches]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre]   = useState('Tous');

  useEffect(() => {
    axios.get(`${API}/poches`, authHeaders())
      .then(r => setPoches(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filtre === 'Tous' ? poches : poches.filter(p => p.type_produit === filtre);

  return (
    <Card>
      <CardHeader>
        <div>
          <div className="text-sm font-bold">Registre d'hémovigilance — Entrées</div>
          <div className="text-[10px] text-white/30 mt-0.5 uppercase tracking-[.08em]">Méthode FIFO · priorité péremption</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['Tous','CGR','PFC','CPA'].map(f => (
            <button key={f} onClick={() => setFiltre(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition border ${filtre === f ? 'bg-red-700 text-white border-red-700' : 'bg-white/[.04] border-white/[.07] text-white/50 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </CardHeader>
      {loading ? <Spinner /> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>{['ID Poche','Type','Collecte','Péremption','Groupe','Statut'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6} className="text-center text-white/20 text-xs py-6">Aucune poche trouvée.</td></tr>
                : filtered.map(r => (
                  <tr key={r.id} className={`hover:bg-white/[.02] transition ${r.status === 'Sorti' ? 'opacity-50' : ''}`}>
                    <td className={`${tdCls} font-bold text-red-400 font-mono text-[10px]`}>{r.code_barre}</td>
                    <td className={`${tdCls} text-white/40 text-[11px]`}>{r.type_produit}</td>
                    <td className={`${tdCls} text-white/40 text-[11px]`}>{r.date_prelevement}</td>
                    <td className={`${tdCls} text-[11px]`}>{r.date_peremption}</td>
                    <td className={tdCls}>{groupeBadge(r.groupe)}</td>
                    <td className={tdCls}>
                      {r.status === 'Disponible'
                        ? <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Disponible</span>
                        : <span className="px-2 py-0.5 rounded text-[9px] font-black bg-white/5 text-white/40 border border-white/10">Sorti</span>
                      }
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

const SectionRegSorties = () => {
  const [sorties, setSorties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/poches?status=Sorti`, authHeaders())
      .then(r => setSorties(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <div>
          <div className="text-sm font-bold">Registre des sorties — Hémovigilance</div>
          <div className="text-[10px] text-white/30 mt-0.5 uppercase tracking-[.08em]">Traçabilité · livraisons</div>
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {loading ? '...' : `${sorties.length} sorties`}
        </span>
      </CardHeader>
      {loading ? <Spinner /> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>{['Date','ID Poche','Groupe','Service','Motif','Agent'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
            <tbody>
              {sorties.length === 0
                ? <tr><td colSpan={6} className="text-center text-white/20 text-xs py-6">Aucune sortie enregistrée.</td></tr>
                : sorties.map(r => (
                  <tr key={r.id} className="hover:bg-white/[.02] transition">
                    <td className={`${tdCls} text-white/30 font-mono text-[10px]`}>{r.updated_at?.slice(0,10) || '—'}</td>
                    <td className={`${tdCls} font-bold text-red-400 font-mono text-[10px]`}>{r.code_barre}</td>
                    <td className={tdCls}>{groupeBadge(r.groupe)}</td>
                    <td className={`${tdCls} text-[11px]`}>{r.service_destinataire || '—'}</td>
                    <td className={`${tdCls} text-[11px] text-white/50`}>{r.motif_sortie || '—'}</td>
                    <td className={`${tdCls} text-[10px] text-white/30 italic`}>{r.agent?.name || '—'}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

const SectionRegRebuts = () => {
  const [rebuts, setRebuts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/poches?status=Sorti`, authHeaders())
      .then(r => setRebuts(r.data.filter(p => p.motif_sortie?.toLowerCase().includes('destruction'))))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border-amber-500/10">
      <CardHeader>
        <div>
          <div className="text-sm font-bold">Registre des rebuts — Pertes justifiées</div>
          <div className="text-[10px] text-white/30 mt-0.5 uppercase tracking-[.08em]">Visa agent · horodatage · traçabilité</div>
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
          {loading ? '...' : `${rebuts.length} total`}
        </span>
      </CardHeader>
      {loading ? <Spinner /> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>{['Horodatage','ID Poche','Groupe','Motif','Agent','Document'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
              <tbody>
                {rebuts.length === 0
                  ? <tr><td colSpan={6} className="text-center text-white/20 text-xs py-6">Aucun rebut enregistré.</td></tr>
                  : rebuts.map(r => (
                    <tr key={r.id} className="hover:bg-white/[.02] transition">
                      <td className={`${tdCls} text-white/30 font-mono text-[10px]`}>{r.updated_at?.slice(0,16).replace('T',' ') || '—'}</td>
                      <td className={`${tdCls} font-bold text-amber-400 font-mono text-[10px]`}>{r.code_barre}</td>
                      <td className={tdCls}>{groupeBadge(r.groupe)}</td>
                      <td className={`${tdCls} text-[11px] text-red-300/80`}>{r.motif_sortie}</td>
                      <td className={`${tdCls} text-[11px] text-white/30 italic`}>{r.agent?.name || '—'}</td>
                      <td className={`${tdCls} text-right`}>
                        <button className="bg-white/[.04] border border-white/[.07] text-white/50 hover:bg-white/[.08] px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 ml-auto">
                          <i className="fa-solid fa-file-pdf text-[9px]"/>PV
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-white/[.06] flex justify-end">
            <button className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2 transition">
              <i className="fa-solid fa-file-pdf text-[10px]"/>Exporter le rapport de pertes
            </button>
          </div>
        </>
      )}
    </Card>
  );
};

/* ─────────────────────────────────────────────
   NAV + COMPOSANT PRINCIPAL
   ───────────────────────────────────────────── */
const NAV_ITEMS = [
  { id:'accueil',     icon:'fa-gauge-high',    label:'Tableau de bord',  group:'nav' },
  { id:'reception',   icon:'fa-square-plus',   label:'Réception sang',   group:'ops' },
  { id:'sortie',      icon:'fa-truck-fast',     label:'Guichet / Sortie', group:'ops' },
  { id:'pertes',      icon:'fa-radiation',      label:'Mise au rebut',    group:'ops' },
  { id:'reg-entrees', icon:'fa-clipboard-list', label:'Registre Entrées', group:'reg' },
  { id:'reg-sorties', icon:'fa-file-export',    label:'Registre Sorties', group:'reg' },
  { id:'reg-rebuts',  icon:'fa-biohazard',      label:'Registre Rebuts',  group:'reg' },
];

const SECTION_META = {
  'accueil':     { title:'Tableau de bord',  sub:'UTS · CNHU-HKM Cotonou · Poste opérationnel' },
  'reception':   { title:'Réception sang',    sub:'Enregistrement & qualification · méthode FIFO' },
  'sortie':      { title:'Guichet / Sortie',  sub:'Cliquez sur une poche pour ouvrir le formulaire' },
  'pertes':      { title:'Mise au rebut',      sub:'Sélectionnez la poche à détruire dans la liste' },
  'reg-entrees': { title:'Registre Entrées',  sub:'Méthode FIFO · priorité péremption' },
  'reg-sorties': { title:'Registre Sorties',  sub:'Traçabilité hémovigilance' },
  'reg-rebuts':  { title:'Registre Rebuts',   sub:'Destructions enregistrées' },
};

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [section, setSection]           = useState('accueil');
  const [clock, setClock]               = useState('');
  const [toastMsg, setToastMsg]         = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [alertOpen, setAlertOpen]       = useState(false);
  const [alertForm, setAlertForm]       = useState({ groupe:'O− (Universel donneur)', poches:'', canal:'WhatsApp + Facebook' });
  const [alertSaving, setAlertSaving]   = useState(false);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit', second:'2-digit' }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const toast = useCallback((msg) => {
    setToastMsg(msg); setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  }, []);

  const user = (() => { try { return JSON.parse(localStorage.getItem('USER_DATA')) || {}; } catch { return {}; } })();

  const handleLogout = () => {
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('USER_DATA');
    navigate('/');
  };

  const handleLancerAlerte = async () => {
    setAlertSaving(true);
    try {
      await axios.post(`${API}/admin/publish-alert`, {
        group:          alertForm.groupe.split(' ')[0].replace('−','-'),
        needed_pockets: parseInt(alertForm.poches) || 20,
        location:       'CNHU-HKM (COTONOU)',
      }, authHeaders());
      setAlertOpen(false);
      toast(`Alerte ${alertForm.groupe.split(' ')[0]} · ${alertForm.poches || 20} poches — diffusée.`);
    } catch(err) {
      toast("Erreur lors du déclenchement.");
    } finally { setAlertSaving(false); }
  };

  const meta = SECTION_META[section];
  const navGroups = [{ key:'nav', label:'Navigation' }, { key:'ops', label:'Opérations Stock' }, { key:'reg', label:'Registres' }];

  const renderSection = () => {
    switch(section) {
      case 'accueil':     return <SectionAccueil />;
      case 'reception':   return <SectionReception toast={toast} />;
      case 'sortie':      return <SectionSortie    toast={toast} />;
      case 'pertes':      return <SectionPertes    toast={toast} />;
      case 'reg-entrees': return <SectionRegEntrees />;
      case 'reg-sorties': return <SectionRegSorties />;
      case 'reg-rebuts':  return <SectionRegRebuts />;
      default:            return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'#07090f', fontFamily:"'DM Sans',sans-serif", color:'#f1f5f9' }}>

      {/* ══ SIDEBAR ══ */}
      <aside className="w-60 flex-shrink-0 flex flex-col border-r overflow-y-auto" style={{ background:'#0d1117', borderColor:'rgba(255,255,255,.07)' }}>
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="w-8 h-8 bg-red-700 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <i className="fa-solid fa-droplet text-white text-xs" />
          </div>
          <div>
            <div className="font-black text-sm tracking-tight leading-none" style={{ fontFamily:"'Montserrat',sans-serif" }}>
              SANG<span className="text-red-500">&</span>VIE
            </div>
            <div className="text-[8px] font-bold uppercase tracking-[.12em] mt-0.5" style={{ color:'rgba(255,255,255,.3)' }}>CNHU-HKM · Cotonou</div>
          </div>
        </div>

        {navGroups.map(({ key, label }) => (
          <div key={key} className="px-3 mb-2">
            <div className="text-[9px] font-black uppercase tracking-[.15em] px-2 py-1 mb-1" style={{ color:'rgba(255,255,255,.15)' }}>{label}</div>
            {NAV_ITEMS.filter(n => n.group === key).map(({ id, icon, label: lbl }) => (
              <button key={id} onClick={() => setSection(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-all text-xs font-semibold ${section === id ? 'bg-red-700/15 text-white border border-red-700/20' : 'text-white/35 hover:bg-white/[.05] hover:text-white'}`}>
                <span className="w-4 text-center flex-shrink-0">
                  <i className={`fa-solid ${icon} text-[11px] ${section === id ? 'text-red-400' : ''}`} />
                </span>
                <span className="flex-1">{lbl}</span>
              </button>
            ))}
          </div>
        ))}

        <div className="px-3 mb-2">
          <div className="text-[9px] font-black uppercase tracking-[.15em] px-2 py-1 mb-1" style={{ color:'rgba(255,255,255,.15)' }}>Actions</div>
          <button onClick={() => setAlertOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all"
            style={{ background:'rgba(157,2,8,.08)', borderColor:'rgba(157,2,8,.15)', color:'#ff6b6b' }}>
            <i className="fa-solid fa-bullhorn text-[11px]" />
            <div className="text-left flex-1">
              <div className="text-[11px] font-bold">Déclencher alerte</div>
              <div className="text-[8px] opacity-50 uppercase tracking-[.08em]">Mobilisation don</div>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" style={{ boxShadow:'0 0 8px #10b981' }} />
          </button>
        </div>

        <div className="mt-auto px-3 pb-4 pt-4 border-t" style={{ borderColor:'rgba(255,255,255,.07)' }}>
          <div className="flex items-center gap-2.5 bg-white/[.04] border rounded-xl px-3 py-2.5 mb-2" style={{ borderColor:'rgba(255,255,255,.07)' }}>
            <div className="w-8 h-8 rounded-lg bg-red-700/20 flex items-center justify-center text-[11px] font-black text-red-400 flex-shrink-0">
              {user.name?.slice(0,2).toUpperCase() || 'AG'}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-white truncate">{user.name || 'Agent ANTS'}</div>
              <div className="text-[9px] uppercase tracking-[.08em]" style={{ color:'rgba(255,255,255,.3)' }}>UTS · CNHU-HKM</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold transition hover:text-red-400" style={{ color:'rgba(255,255,255,.3)' }}>
            <i className="fa-solid fa-arrow-right-from-bracket text-[10px]" />Déconnexion
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-7 py-4 border-b flex-shrink-0" style={{ borderColor:'rgba(255,255,255,.07)' }}>
          <div>
            <h1 className="font-black text-xl tracking-tight" style={{ fontFamily:"'Montserrat',sans-serif" }}>{meta.title}</h1>
            <p className="text-[10px] uppercase tracking-[.1em] mt-0.5" style={{ color:'rgba(255,255,255,.3)' }}>{meta.sub}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold" style={{ background:'rgba(16,185,129,.08)', borderColor:'rgba(16,185,129,.2)', color:'#10b981' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Système opérationnel
            </div>
            <div className="px-3 py-1.5 rounded-xl border text-[11px] font-mono font-semibold" style={{ background:'rgba(255,255,255,.04)', borderColor:'rgba(255,255,255,.07)', color:'rgba(255,255,255,.4)' }}>
              <i className="fa-regular fa-clock mr-1.5" />{clock}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-7 py-6">{renderSection()}</div>
      </main>

      {/* ══ MODAL ALERTE ══ */}
      {alertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setAlertOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl p-7 border z-10" style={{ background:'#0d1117', borderColor:'rgba(255,255,255,.1)' }}>
            <button onClick={() => setAlertOpen(false)} className="absolute right-5 top-5 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'rgba(255,255,255,.05)', color:'rgba(255,255,255,.4)' }}>
              <i className="fa-solid fa-xmark text-sm" />
            </button>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background:'rgba(239,68,68,.15)' }}>
              <i className="fa-solid fa-bullhorn text-red-400" />
            </div>
            <h3 className="font-black text-lg mb-1" style={{ fontFamily:"'Montserrat',sans-serif" }}>
              Déclencher une <span className="text-red-500">alerte</span>
            </h3>
            <p className="text-[11px] mb-5" style={{ color:'rgba(255,255,255,.3)' }}>Mobilisation don de sang · CNHU-HKM</p>
            <div className="space-y-4">
              <div>
                <label className={labelCls} style={{ color:'#ef4444' }}>1. Groupe sanguin critique</label>
                <select value={alertForm.groupe} onChange={e => setAlertForm(p => ({...p, groupe:e.target.value}))} className={inputCls} style={{ appearance:'none' }}>
                  {['O− (Universel donneur)','A−','B−','AB−'].map(g => <option key={g} className="bg-slate-900">{g}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>2. Besoin (poches)</label>
                  <input type="number" placeholder="Ex: 20" value={alertForm.poches} onChange={e => setAlertForm(p => ({...p, poches:e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>3. Canal</label>
                  <select value={alertForm.canal} onChange={e => setAlertForm(p => ({...p, canal:e.target.value}))} className={inputCls} style={{ appearance:'none' }}>
                    {['WhatsApp + Facebook','WhatsApp uniquement','Tous les canaux'].map(c => <option key={c} className="bg-slate-900">{c}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleLancerAlerte} disabled={alertSaving}
                className="w-full py-3.5 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase tracking-[.1em] transition flex items-center justify-center gap-2">
                {alertSaving ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-bolt" />}
                {alertSaving ? 'Envoi...' : "Lancer l'alerte nationale"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ══ */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-800 border border-white/10 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl transition-all duration-300"
        style={{ transform: toastVisible ? 'translateY(0)' : 'translateY(120%)', opacity: toastVisible ? 1 : 0 }}>
        <i className="fa-solid fa-circle-check text-emerald-400" />{toastMsg}
      </div>
    </div>
  );
};

export default AgentDashboard;