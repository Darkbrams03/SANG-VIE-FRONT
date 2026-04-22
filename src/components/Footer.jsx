const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const NAV_LINKS = [
  { label: 'Stocks en direct',   id: 'stocks',           icon: 'fa-droplet' },
  { label: 'Le CNHU-HKM',        id: 'cnhu',             icon: 'fa-hospital' },
  { label: 'Devenir donneur',     id: 'devenir-donneur',  icon: 'fa-heart-pulse' },
  { label: 'Urgences',           id: 'urgences-section', icon: 'fa-truck-medical' },
];

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* ── Marque ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-red-700 rounded-xl flex items-center justify-center shadow-md">
                <i className="fa-solid fa-droplet text-white text-sm" />
              </div>
              <span
                className="font-black text-lg tracking-tight"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                SANG<span className="text-red-500">&</span>VIE
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              Plateforme de monitoring des stocks de sang du CNHU-HKM de
              Cotonou. Notre mission : connecter chaque don à une vie sauvée
              au Bénin.
            </p>
            {/* Réseaux sociaux */}
            <div className="flex gap-3">
              {[
                { icon: 'fa-brands fa-facebook-f', href: '#' },
                { icon: 'fa-brands fa-whatsapp',   href: '#' },
              ].map(({ icon, href }) => (
                <a
                  key={icon}
                  href={href}
                  className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-700 hover:text-white transition"
                >
                  <i className={`${icon} text-xs`} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Navigation ── */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[.2em] text-slate-500 mb-6 border-l-2 border-red-700 pl-3">
              Plateforme
            </h4>
            <ul className="space-y-3 text-sm text-slate-400 font-medium">
              {NAV_LINKS.map(({ label, id, icon }) => (
                <li key={id}>
                  <button
                    onClick={() => scrollTo(id)}
                    className="hover:text-red-400 transition-colors flex items-center gap-2"
                  >
                    <i className={`fa-solid ${icon} text-xs`} />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[.2em] text-slate-500 mb-6 border-l-2 border-red-700 pl-3">
              Contact
            </h4>
            <div className="space-y-5 text-sm">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                  Transfusion CNHU-HKM
                </span>
                <a
                  href="tel:+22921301045"
                  className="font-black text-xl text-red-500 tracking-tight hover:text-red-400 transition"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  +229 21 30 10 45
                </a>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                  Support plateforme
                </span>
                <a
                  href="mailto:support@sangvie.bj"
                  className="font-bold text-white hover:text-red-400 transition-colors"
                >
                  support@sangvie.bj
                </a>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                  SAMU Bénin (urgences)
                </span>
                <a
                  href="tel:116"
                  className="font-black text-xl text-red-500 tracking-tight hover:text-red-400 transition"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  116
                </a>
              </div>
            </div>
          </div>

          {/* ── Localisation ── */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[.2em] text-slate-500 mb-6 border-l-2 border-red-700 pl-3">
              Localisation
            </h4>
            <div className="relative w-full h-40 bg-slate-900 rounded-2xl overflow-hidden border border-white/8">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=2.3850%2C6.3680%2C2.4100%2C6.3800&layer=mapnik"
                className="w-full h-full"
                style={{
                  border: 'none',
                  filter: 'grayscale(1) brightness(.4)',
                }}
                loading="lazy"
                title="CNHU Cotonou"
              />
              {/* Overlay pin */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                <div className="w-9 h-9 bg-red-700 rounded-full flex items-center justify-center shadow-lg shadow-red-700/40 animate-bounce">
                  <i className="fa-solid fa-location-dot text-white text-sm" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow">
                    Cotonou, Bénin
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium italic">
                    Avenue Jean-Paul II
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-600 text-center md:text-left">
            © {new Date().getFullYear()}{' '}
            <span className="text-white">SANG & VIE · CNHU-HKM</span>. Tous
            droits réservés.
          </p>
          <div className="flex gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">
              Confidentialité
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Mentions légales
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;