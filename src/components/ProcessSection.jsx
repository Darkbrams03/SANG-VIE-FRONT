import { useEffect } from 'react';

// 🔥 IMPORTATION DE AOS POUR LES ANIMATIONS AU SCROLL
import AOS from 'aos';
import 'aos/dist/aos.css';

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const STEPS = [
  {
    num: '01',
    icon: 'fa-clipboard-list',
    title: "L'entretien médical",
    desc: "Un questionnaire confidentiel et un entretien avec un médecin du CNHU-HKM pour vérifier votre éligibilité. Rapide et bienveillant.",
  },
  {
    num: '02',
    icon: 'fa-syringe',
    title: 'Le prélèvement',
    desc: "Le don lui-même dure ~10 minutes. Matériel stérile et usage unique. Nos équipes du CNHU assurent votre confort tout au long.",
  },
  {
    num: '03',
    icon: 'fa-mug-hot',
    title: 'Le repos & collation',
    desc: "Une collation vous est offerte après le don. Un moment de récupération suivi par notre équipe soignante.",
  },
];

const ProcessSection = () => {
  
  // Garantir que les coordonnées d'AOS sont recalculées si nécessaire au chargement du composant
  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <section id="comment-donner" className="bg-slate-900 py-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        {/* 🔥 Glissement vers le haut de l'en-tête */}
        <div className="mb-14" data-aos="fade-up">
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-400 mb-3">
            Processus de don
          </p>
          <h2
            className="text-3xl md:text-4xl font-black uppercase tracking-tight"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Comment devenir un{' '}
            <span className="text-red-500">héros</span> ?
          </h2>
          <p className="mt-3 text-slate-400 max-w-xl text-sm">
            Le don de sang au CNHU-HKM est simple, sécurisé et dure environ
            40 minutes. Un acte qui peut sauver jusqu'à 3 vies.
          </p>
        </div>

        {/* ── Steps ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {STEPS.map(({ num, icon, title, desc }, index) => (
            // 🔥 Chaque étape glisse depuis la gauche avec un retard cumulé (0ms, 200ms, 400ms) pour l'effet chronologique
            <div 
              key={num} 
              className="relative pt-8 group"
              data-aos="fade-right"
              data-aos-delay={index * 200}
            >
              {/* Numéro décoratif */}
              <span
                className="absolute top-0 -left-1 text-[5rem] font-black leading-none pointer-events-none select-none text-white/[.04] group-hover:text-red-700/20 transition-colors duration-300"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {num}
              </span>

              {/* Icône */}
              <div className="relative w-12 h-12 bg-red-700/20 rounded-2xl flex items-center justify-center mb-4">
                <i className={`fa-solid ${icon} text-red-400 text-lg`} />
              </div>

              {/* Texte */}
              <div className="relative">
                <h4 className="font-bold text-lg mb-3">{title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA Banner ── */}
        {/* 🔥 Le bandeau final surgit avec un zoom fluide dès que le reste est apparu */}
        <div 
          className="mt-16 p-px rounded-3xl" 
          style={{ background: 'linear-gradient(to right, #9d0208, #f97316)' }}
          data-aos="zoom-in"
          data-aos-delay="600"
        >
          <div className="bg-slate-900 rounded-[calc(1.5rem-1px)] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-xl">Prêt à faire la différence ?</h3>
              <p className="text-slate-400 text-sm mt-1">
                Vérifiez votre éligibilité en 2 minutes et inscrivez-vous.
              </p>
            </div>
            <div className="flex gap-3 shrink-0 flex-wrap justify-center">
              <button
                onClick={() => scrollTo('devenir-donneur')}
                className="bg-red-700 hover:bg-red-800 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-900/20 flex items-center gap-2"
              >
                <i className="fa-solid fa-heart-pulse text-xs" />
                Prendre rendez-vous
              </button>
              <a
                href="tel:+22921301045"
                className="border border-slate-700 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-phone text-xs" />
                Nous appeler
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProcessSection;