const BLOOD_GROUPS = ['A+', 'A−', 'B+', 'B−', 'O+', 'O−', 'AB+', 'AB−', 'Inconnu'];



const FEATURES = [
  {
    icon: 'fa-shield-heart',
    title: 'Données protégées',
    desc: 'Vos infos restent strictement médicales.',
  },
  {
    icon: 'fa-bell',
    title: 'Alertes WhatsApp/SMS',
    desc: "Contacté uniquement en cas d'urgence réelle.",
  },
  {
    icon: 'fa-hospital',
    title: 'Don au CNHU-HKM',
    desc: 'Collecte dans un cadre médical sécurisé.',
  },
  {
    icon: 'fa-hand-holding-heart',
    title: '100% bénévole',
    desc: 'Don volontaire, gratuit et anonyme.',
  },
];

const DonorRegistration = ({
  formData,
  setFormData,
  handleSubmit,
  isSubmitted,
}) => {
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Classes partagées pour les inputs
  const inputCls =
    'w-full bg-white/[.06] border border-white/20 rounded-2xl py-4 px-5 text-sm text-white placeholder:text-white/30 focus:ring-2 focus:ring-white/40 focus:bg-white/10 transition-all outline-none';

  const labelCls =
    'block text-[11px] font-black uppercase text-white/50 tracking-[.15em] mb-1.5';

  return (
    <section
      id="devenir-donneur"
      className="w-full py-20 relative overflow-hidden"
      style={{ background: '#9d0208' }}
    >
      {/* Décors ambients */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Texte gauche ── */}
          <div className="text-white space-y-6">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-200">
              Rejoindre le réseau
            </p>
            <h2
              className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Prêt à devenir
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(to right, #fecaca, #ffffff)',
                }}
              >
                un héros local ?
              </span>
            </h2>
            <p className="text-red-100 text-base font-light leading-relaxed max-w-md">
              Inscrivez-vous en moins de 2 minutes. En cas de besoin critique
              pour votre groupe sanguin au CNHU-HKM, vous serez alerté par SMS.
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {FEATURES.map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <i className={`fa-solid ${icon} text-red-200`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{title}</h4>
                    <p className="text-[11px] text-red-100/60 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Formulaire ── */}
          <div className="bg-white/10 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-2xl">

            {!isSubmitted ? (
              <>
                <h3 className="font-black text-white text-lg mb-6">
                  S'inscrire comme donneur
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Nom + Groupe */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Nom complet</label>
                      <input
                        type="text"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                        placeholder="Ex: Koffi Agossou"
                        className={inputCls}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Groupe sanguin</label>
                      <select
                        name="blood_group"
                        value={formData.blood_group}
                        onChange={handleChange}
                        className={inputCls}
                        style={{ appearance: 'none' }}
                        required
                      >
                        <option value="" disabled className="bg-slate-900">
                          Choisir...
                        </option>
                        {BLOOD_GROUPS.map((g) => (
                          <option key={g} value={g} className="bg-slate-900">
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className={labelCls}>Téléphone WhatsApp</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-white/50">
                        +229
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="01 23 45 67"
                        className={`${inputCls} pl-16`}
                        required
                      />
                    </div>
                  </div>

                  {/* Quartier */}
                  <div>
                    <label className={labelCls}>Quartier / Arrondissement</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Ex: Cadjehoun, Akpakpa..."
                      className={inputCls}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full bg-white text-red-700 py-4 rounded-2xl font-black text-xs uppercase tracking-[.15em] hover:bg-red-50 hover:scale-[1.01] transition-all shadow-xl mt-2"
                  >
                    Rejoindre le réseau SANG & VIE
                  </button>

                  <p className="text-center text-[10px] text-white/40 leading-relaxed px-4">
                    En vous inscrivant, vous acceptez d'être contacté uniquement
                    pour des besoins de don de sang au CNHU-HKM.
                  </p>
                </form>
              </>
            ) : (
              /* ── Message succès ── */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                  <i className="fa-solid fa-check text-white text-2xl" />
                </div>
                <h4 className="font-black text-white text-lg">Merci, héros !</h4>
                <p className="text-red-100 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
                  Votre inscription a bien été enregistrée. Vous serez alerté
                  en cas d'urgence pour votre groupe sanguin.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default DonorRegistration;