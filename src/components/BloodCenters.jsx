// 🔥 IMPORTATION DE AOS POUR LES ANIMATIONS AU SCROLL
import AOS from 'aos';
import 'aos/dist/aos.css';

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const INFO_CARDS = [
  {
    icon: 'fa-location-dot',
    label: 'Adresse',
    value: 'Avenue Jean-Paul II, Cotonou',
  },
  {
    icon: 'fa-clock',
    label: 'Transfusion sanguine',
    value: 'Lun – Sam · 7h00 – 17h00',
  },
  {
    icon: 'fa-phone',
    label: 'Contact direct',
    value: '+229 21 30 10 45',
    href: 'tel:+22921301045',
  },
  {
    icon: 'fa-truck-medical',
    label: 'Urgences 24h/24',
    value: '116 (SAMU Bénin)',
    href: 'tel:116',
  },
];

const BloodCenters = () => {
  return (
    <section id="cnhu" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Texte gauche ── */}
          {/* 🔥 Glissement depuis la gauche pour le bloc de présentation et les cartes */}
          <div data-aos="fade-right">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-500 mb-3">
              Centre partenaire
            </p>
            <h2
              className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 leading-tight"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              CNHU-HKM
              <br />
              <span className="text-red-700">Hubert Koutoukou Maga</span>
            </h2>

            <p className="mt-5 text-slate-500 leading-relaxed text-sm font-light">
              Le Centre National Hospitalier Universitaire Hubert Koutoukou Maga
              de Cotonou est le principal hôpital de référence du Bénin. Son
              service de transfusion sanguine assure la collecte, le traitement
              et la distribution du sang pour l'ensemble des services hospitaliers.
            </p>

            {/* Info cards */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {INFO_CARDS.map(({ icon, label, value, href }) => (
                <div
                  key={label}
                  className="bg-slate-50 rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-3xl"
                >
                  <i className={`fa-solid ${icon} text-red-600 mb-2 block`} />
                  <p className="text-xs font-black text-slate-700">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      className="text-xs text-red-600 font-bold mt-0.5 block hover:text-red-700 transition"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-xs text-slate-500 mt-0.5">{value}</p>
                  )}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex gap-3 flex-wrap">
              <a
                href="https://maps.google.com/?q=CNHU-HKM+Cotonou"
                target="_blank"
                rel="noreferrer"
                className="bg-red-700 text-white px-5 py-3 rounded-xl text-xs font-bold transition hover:opacity-90 hover:scale-105 flex items-center gap-2 shadow-lg shadow-red-900/20"
              >
                <i className="fa-solid fa-map-location-dot" />
                Itinéraire
              </a>
              <button
                onClick={() => scrollTo('devenir-donneur')}
                className="border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 px-5 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.01]"
              >
                Prendre rendez-vous
              </button>
            </div>
          </div>

          {/* ── Carte OpenStreetMap droite ── */}
          {/* 🔥 Glissement depuis la droite avec un léger retard pour un effet asynchrone élégant */}
          <div 
            className="relative" 
            data-aos="fade-left"
            data-aos-delay="200"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 aspect-square max-w-md mx-auto">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=2.3800%2C6.3600%2C2.4200%2C6.3900&layer=mapnik&marker=6.3728%2C2.4009"
                className="w-full h-full"
                style={{ border: 'none', filter: 'grayscale(.3) contrast(1.1)' }}
                loading="lazy"
                title="Localisation CNHU-HKM Cotonou"
              />
            </div>

            {/* Badge flottant */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              CNHU-HKM · Cotonou, Bénin
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BloodCenters;