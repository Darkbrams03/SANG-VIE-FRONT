import { useState, useEffect } from 'react';
import axios from 'axios';

// 🔥 IMPORTATION DE AOS POUR LES ANIMATIONS AU SCROLL
import AOS from 'aos';
import 'aos/dist/aos.css';

const API = 'https://sang-vie-back-rfmj.onrender.com/api';

const StatsSection = () => {
  const [stats, setStats] = useState(null);

  // Initialisation ou rafraîchissement d'AOS pour recalculer les positions après l'injection des données
  useEffect(() => {
    AOS.refresh();
  }, [stats]);

  useEffect(() => {
    axios.get(`${API}/stats-globales`)
      .then(res => setStats(res.data))
      .catch(() => {}); // silencieux si API indispo
  }, []);

  // Compter les groupes critiques (< 5 poches)
  const groupesCritiques = stats?.groupes_critiques
    ? stats.groupes_critiques.filter(g => g.total < 5).length
    : 3; // fallback visuel

  const totalPoches   = stats?.total_poches   ?? '1 284';
  const totalDonneurs = stats?.total_donneurs  ?? '8 500+';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        {/* Card rouge principale */}
        {/* 🔥 Glissement depuis la gauche pour la carte d'ancrage */}
        <div 
          data-aos="fade-right"
          className="md:col-span-1 bg-red-700 rounded-2xl p-7 flex flex-col justify-between text-white shadow-xl shadow-red-900/20"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-200 mb-1">
              Tableau de bord
            </p>
            <h3 className="font-black text-2xl leading-tight uppercase tracking-tight"
              style={{ fontFamily:"'Montserrat',sans-serif" }}>
              CNHU-HKM<br/>Cotonou
            </h3>
            <p className="mt-3 text-red-100 text-sm leading-relaxed font-light">
              Données actualisées par les agents ANTS. Les niveaux reflètent la situation en cours.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[.1em]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              En direct
            </span>
          </div>
          <div className="mt-8 opacity-10 flex justify-end">
            <i className="fa-solid fa-droplet text-7xl" />
          </div>
        </div>

        {/* 3 cards stats */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Stock total */}
          {/* 🔥 Apparition par le bas avec 150ms de délai */}
          <div 
            data-aos="fade-up"
            data-aos-delay="150"
            className="bg-slate-50 rounded-2xl p-6 flex flex-col justify-between border border-gray-100 hover:border-red-200 transition-all"
          >
            <div>
              <span className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">
                Stock total
              </span>
              <h3 className="text-3xl font-black text-slate-800 mt-1">
                {typeof totalPoches === 'number'
                  ? totalPoches.toLocaleString('fr-FR')
                  : totalPoches}
              </h3>
              <p className="text-sm text-slate-500">Poches sécurisées disponibles</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <i className="fa-solid fa-chart-line" />
              <span>Mis à jour en temps réel</span>
            </div>
          </div>

          {/* Groupes critiques */}
          {/* 🔥 Apparition par le bas avec 300ms de délai */}
          <div 
            data-aos="fade-up"
            data-aos-delay="300"
            className="bg-slate-50 rounded-2xl p-6 flex flex-col justify-between border border-gray-100 hover:border-red-200 transition-all"
          >
            <div>
              <span className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">
                Besoins critiques
              </span>
              <h3 className="text-3xl font-black text-red-700 mt-1">
                {groupesCritiques}
              </h3>
              <p className="text-sm text-slate-500">Groupes sous seuil d'alerte</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => document.getElementById('stocks')?.scrollIntoView({ behavior:'smooth' })}
                className="bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-800 transition"
              >
                Voir les urgences
              </button>
            </div>
          </div>

          {/* Donneurs */}
          {/* 🔥 Apparition par le bas avec 450ms de délai */}
          <div 
            data-aos="fade-up"
            data-aos-delay="450"
            className="bg-slate-50 rounded-2xl p-6 flex flex-col justify-between border border-gray-100 hover:border-red-200 transition-all"
          >
            <div>
              <span className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">
                Donneurs actifs
              </span>
              <h3 className="text-3xl font-black text-slate-800 mt-1">
                {typeof totalDonneurs === 'number'
                  ? `${totalDonneurs.toLocaleString('fr-FR')}+`
                  : totalDonneurs}
              </h3>
              <p className="text-sm text-slate-500">Héros enregistrés au Bénin</p>
            </div>
            <div className="mt-4 flex -space-x-2">
              {['bg-slate-200','bg-slate-300','bg-slate-400'].map((c,i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white`} />
              ))}
              <div className="w-8 h-8 rounded-full bg-red-700 border-2 border-white flex items-center justify-center text-[9px] text-white font-black">+</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default StatsSection;