import { useState, useEffect } from 'react';

// 🔥 IMPORTATION DE AOS POUR LES ANIMATIONS AU SCROLL
import AOS from 'aos';
import 'aos/dist/aos.css';

// Images dans /public — référencées par URL directe (Vite + dossier public)
const SLIDES = [
  { src: '/assets/I1.jpg', alt: 'Don de sang au CNHU' },
  { src: '/assets/I2.jpg', alt: 'Laboratoire CNHU' },
  { src: '/assets/I3.jpg', alt: 'Équipe médicale CNHU' },
];

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const Hero = () => {
  const [current, setCurrent] = useState(0);

  // Carousel automatique toutes les 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // S'assurer que le positionnement d'AOS est synchronisé au montage
  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <section className="relative w-full h-[92vh] overflow-hidden bg-black">

      {/* ── Slides ── */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 w-full h-full transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={slide.src}
            alt={slide.alt}
            className="w-full h-full object-cover object-center"
          />
        </div>
      ))}

      {/* ── Overlay dégradé ── */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,.35) 0%, rgba(0,0,0,.6) 60%, rgba(0,0,0,.85) 100%)',
        }}
      />

      {/* ── Contenu centré ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center justify-center text-center">

        {/* Badge institution */}
        {/* 🔥 Descente en douceur depuis le haut */}
        <div 
          data-aos="fade-down"
          data-aos-duration="800"
          className="mb-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white text-xs font-bold"
        >
          <i className="fa-solid fa-hospital text-red-300" />
          CNHU-HKM · Centre National Hospitalier Universitaire
        </div>

        <div className="max-w-3xl space-y-6">
          {/* Titre */}
          {/* 🔥 Montée percutante avec un léger délai pour laisser le badge s'installer */}
          <h1
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="1000"
            className="text-6xl md:text-8xl font-black text-white leading-[1.05] tracking-tighter uppercase"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Une poche.
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(to right, #fca5a5, #ffffff)',
              }}
            >
              Une vie.
            </span>
          </h1>

          {/* Sous-titre */}
          {/* 🔥 Apparition fluide après le titre principal */}
          <p 
            data-aos="fade-up"
            data-aos-delay="400"
            data-aos-duration="1000"
            className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light"
          >
            Plateforme officielle de monitoring des stocks de sang du{' '}
            <strong className="text-white font-semibold">CNHU-HKM de Cotonou</strong>.
            Consultez la disponibilité en temps réel et rejoignez le réseau des donneurs bénévoles.
          </p>

          {/* CTAs */}
          {/* 🔥 Les boutons apparaissent en dernier pour inviter à l'action finale */}
          <div 
            data-aos="fade-up"
            data-aos-delay="600"
            data-aos-duration="1000"
            className="flex flex-wrap justify-center gap-4 pt-2"
          >
            <button
              onClick={() => scrollTo('stocks')}
              className="bg-red-700 text-white px-10 py-4 rounded-xl font-bold text-sm hover:scale-105 transition-all flex items-center gap-2 shadow-xl"
              style={{ boxShadow: '0 8px 24px rgba(157,2,8,.3)' }}
            >
              <i className="fa-solid fa-droplet text-xs" />
              Voir les stocks
              <i className="fa-solid fa-arrow-right text-xs" />
            </button>
            <button
              onClick={() => scrollTo('devenir-donneur')}
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded-xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-heart-pulse text-xs" />
              Devenir donneur
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;