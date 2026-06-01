import { useState, useEffect } from 'react';
import axios from 'axios';

// 🔥 CONFIGURATION AOS POUR LES ANIMATIONS
import AOS from 'aos';
import 'aos/dist/aos.css';

const API = 'https://sang-vie-back.onrender.com/api';

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const GROUPE_ORDER = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];

const toDisplay = (g) => g?.replace('-', '−') ?? g;

const getStatus = (count) => {
  if (count === 0 || count <= 4) return 'crit';
  if (count <= 15) return 'low';
  return 'ok';
};

const STATUS_CONFIG = {
  ok: {
    badge: 'bg-emerald-500 text-white',
    label: 'DISPONIBLE',
    dot: 'bg-emerald-500 shadow-[0_0_8px_#10b98188]',
    subLabel: 'Niveau suffisant',
    subColor: 'text-white/60',
    card: 'bg-white/[.06] border-white/10',
    btn: 'bg-white/10 hover:bg-white/20',
    btnIcon: 'fa-share-nodes',
  },
  low: {
    badge: 'bg-amber-500 text-white',
    label: 'LIMITÉ',
    dot: 'bg-amber-500 shadow-[0_0_8px_#f59e0b88]',
    subLabel: 'Stock bas',
    subColor: 'text-white/60',
    card: 'bg-white/[.06] border-white/10',
    btn: 'bg-amber-500 hover:bg-amber-400',
    btnIcon: 'fa-plus',
  },
  crit: {
    badge: 'bg-red-500 text-white animate-pulse',
    label: 'CRITIQUE',
    dot: 'bg-red-500 shadow-[0_0_8px_#ef444488] animate-pulse',
    subLabel: 'Don urgent requis',
    subColor: 'text-red-300',
    card: 'border-red-500/60 border-2',
    btn: 'bg-red-500 hover:bg-red-400 shadow-lg',
    btnIcon: 'fa-bell',
  },
};

// Injection directe de index pour gérer un effet de cascade fluide sur les cartes
const BloodCard = ({ group, status, index }) => {
  const cfg = STATUS_CONFIG[status];
  const isCrit = status === 'crit';

  return (
    <div
      data-aos="fade-up"
      data-aos-delay={index * 50} // Apparition en cascade ultra propre
      className={`rounded-[2rem] p-5 border transition-all hover:-translate-y-1 hover:shadow-2xl duration-300 cursor-default ${cfg.card}`}
      style={isCrit ? { background: 'rgba(239,68,68,.08)' } : {}}
    >
      <div className="flex justify-between items-start mb-4">
        <span
          className="text-5xl font-black text-white tracking-tighter"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {group}
        </span>
        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      <div className={`flex items-center gap-2 text-xs font-semibold ${cfg.subColor}`}>
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 inline-block ${cfg.dot}`} />
        {cfg.subLabel}
      </div>

      <div
        className={`mt-4 pt-4 flex justify-between items-center ${
          isCrit ? 'border-t border-red-500/20' : 'border-t border-white/10'
        }`}
      >
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${
            isCrit ? 'text-red-300/60' : 'text-white/30'
          }`}
        >
          {group.includes('−') ? 'Rhésus négatif' : 'Rhésus positif'}
        </span>
        <button
          onClick={() => {
            if (status !== 'ok') scrollTo('devenir-donneur');
          }}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${cfg.btn}`}
        >
          <i className={`fa-solid ${cfg.btnIcon} text-white text-xs`} />
        </button>
      </div>
    </div>
  );
};

const BloodStocks = () => {
  const [filter, setFilter] = useState('all');
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API}/stats-globales`)
      .then((res) => {
        const stocksData = res.data.stocks_par_groupe;

        const heatmap = GROUPE_ORDER.map((g) => {
          const apiKey = g.replace('−', '-');
          const count =
            stocksData && stocksData[apiKey] !== undefined ? stocksData[apiKey] : 0;

          return {
            group: g,
            count: count,
            status: getStatus(count),
          };
        });

        setStocks(heatmap);
      })
      .catch((err) => {
        console.error('Erreur récupération stocks:', err);
        setStocks(GROUPE_ORDER.map((g) => ({ group: g, status: 'ok', count: 20 })));
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔥 CRUCIAL : Force AOS à recalculer la position des éléments dès que le loader disparaît ou qu'un filtre change
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        AOS.refreshHard(); // Réinitialisation profonde d'AOS pour forcer la visibilité des nouveaux éléments du DOM
      }, 50);
    }
  }, [loading, filter]);

  const ordered = GROUPE_ORDER.map((g) => {
    const found = stocks.find((s) => toDisplay(s.group) === g || s.group === g);
    if (found) {
      return {
        group: toDisplay(found.group),
        count: found.count ?? 0,
        status: getStatus(found.count ?? 0),
      };
    }
    return { group: g, status: 'ok', count: 20 };
  });

  const filtered = ordered.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'pos') return b.group.includes('+');
    if (filter === 'neg') return b.group.includes('−');
    return true;
  });

  return (
    <section id="stocks" className="w-full py-16 bg-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header + filtres */}
        <div 
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
          data-aos="fade-right"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-500 mb-2">
              CNHU-HKM · Cotonou
            </p>
            <h2
              className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Disponibilité des stocks
            </h2>
            <p className="mt-2 text-slate-400 text-sm max-w-xl font-light">
              Les niveaux sont affichés sous forme d'indicateurs. Pour toute demande,
              contactez directement le service de transfusion du CNHU-HKM.
            </p>
          </div>

          <div className="flex gap-2 shrink-0 flex-wrap">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'pos', label: 'Rhésus (+)' },
              { key: 'neg', label: 'Rhésus (−)' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  filter === key
                    ? 'bg-white text-red-700 shadow'
                    : 'text-white/60 hover:text-white bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Légende */}
        <div 
          className="flex flex-wrap gap-5 mb-8 text-xs font-bold text-slate-400"
          data-aos="fade-right"
          data-aos-delay="100"
        >
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b98188] inline-block" />
            DISPONIBLE — stock suffisant
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            LIMITÉ — stock bas
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef444488] inline-block animate-pulse" />
            CRITIQUE — urgence don
          </span>
        </div>

        {/* Grid ou Loader */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <i className="fa-solid fa-circle-notch fa-spin text-white/30 text-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {filtered.map((b, index) => (
              <BloodCard key={b.group} group={b.group} status={b.status} index={index} />
            ))}
          </div>
        )}

        {/* Note informative */}
        <div 
          className="mt-8 p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <div className="w-9 h-9 shrink-0 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-circle-info text-blue-300 text-sm" />
          </div>
          <p className="text-slate-400 text-xs leading-relaxed font-light">
            <strong className="text-white">Note importante :</strong> Les niveaux affichés sont
            indicatifs. Toute demande de sang doit être formulée par un professionnel de santé du
            CNHU-HKM. Pour une urgence médicale, appelez directement le service de transfusion.
          </p>
          <a
            href="tel:+22921301045"
            className="shrink-0 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5"
          >
            <i className="fa-solid fa-phone text-xs" />
            +229 21 30 10 45
          </a>
        </div>

      </div>
    </section>
  );
};

export default BloodStocks;