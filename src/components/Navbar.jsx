import { useState, useEffect } from 'react';

const Navbar = ({ onOpenLogin }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Ombre au scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fermer le menu mobile au clic sur un lien
  const handleNavClick = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* ── HEADER ── */}
      <header
        className={`w-full border-b border-gray-100 sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-shadow ${
          scrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[4.5rem] gap-4">

            {/* ── Logo ── */}
            <a
              href="#"
              className="flex-shrink-0 flex items-center gap-2.5"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <div className="w-9 h-9 bg-red-700 rounded-xl flex items-center justify-center shadow-md">
                <i className="fa-solid fa-droplet text-white text-base" />
              </div>
              <div className="leading-none">
                <span
                  className="font-black text-lg text-slate-900 tracking-tight"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  SANG<span className="text-red-700">&</span>VIE
                </span>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  CNHU-HKM · Cotonou
                </p>
              </div>
            </a>

            {/* ── Nav desktop ── */}
            <div className="hidden md:flex items-center gap-7">
              {[
                { label: 'Stocks',          id: 'stocks' },
                { label: 'Le CNHU',         id: 'cnhu' },
                { label: 'Devenir donneur', id: 'comment-donner' },
              ].map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className="text-sm font-bold text-gray-600 hover:text-red-700 transition relative group"
                >
                  {label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-red-700 group-hover:w-full transition-all duration-300" />
                </button>
              ))}

              {/* Urgences avec point animé */}
              <button
                onClick={() => handleNavClick('stocks')}
                className="text-sm font-bold text-gray-600 hover:text-red-700 transition flex items-center gap-1.5 relative group"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Urgences
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-red-700 group-hover:w-full transition-all duration-300" />
              </button>
            </div>

            {/* ── CTAs desktop ── */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => handleNavClick('devenir-donneur')}
                className="text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 px-5 py-2 rounded-xl text-xs font-bold transition"
              >
                <i className="fa-solid fa-heart-pulse mr-1.5" />
                Devenir Donneur
              </button>
              <button
                onClick={onOpenLogin}
                className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold shadow hover:bg-slate-800 transition"
              >
                <i className="fa-solid fa-user-shield mr-1.5" />
                Espace Agent ANTS
              </button>
            </div>

            {/* ── Burger mobile ── */}
            <button
              className="md:hidden p-2 text-slate-700"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'} text-xl transition-all`} />
            </button>
          </div>
        </nav>

        {/* ── Menu mobile ── */}
        <div
          className={`md:hidden fixed inset-x-4 top-20 z-40 transition-all duration-300 ${
            menuOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 space-y-2">

              {/* Liens mobile */}
              {[
                { label: 'Stocks de sang',  id: 'stocks',            icon: 'fa-droplet' },
                { label: 'Le CNHU-HKM',     id: 'cnhu',              icon: 'fa-hospital' },
                { label: 'Comment donner',  id: 'comment-donner',    icon: 'fa-heart-pulse' },
                { label: 'Urgences',        id: 'stocks',  icon: 'fa-truck-medical', urgent: true },
              ].map(({ label, id, icon, urgent }) => (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-red-50 transition group text-left ${
                    urgent ? 'text-red-600' : ''
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition ${
                      urgent
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-red-700 group-hover:text-white'
                    }`}
                  >
                    <i className={`fa-solid ${icon}`} />
                  </div>
                  <span className="font-bold text-sm text-slate-700">{label}</span>
                </button>
              ))}

              <hr className="border-gray-100 my-1" />

              {/* CTAs mobile */}
              <button
                onClick={() => handleNavClick('devenir-donneur')}
                className="w-full py-3.5 bg-red-700 text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-heart-pulse" />
                Devenir Donneur
              </button>
              <button
                onClick={() => { setMenuOpen(false); onOpenLogin(); }}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-user-shield" />
                Espace Agent ANTS
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;