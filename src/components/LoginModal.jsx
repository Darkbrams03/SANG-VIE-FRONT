import { useEffect, useState } from 'react';

const LoginModal = ({
  isOpen,
  onClose,
  loginData,
  setLoginData,
  handleLogin,
}) => {
  const [animate, setAnimate] = useState(false);

  // Gérer uniquement le déclenchement de l'animation d'apparition
  useEffect(() => {
    if (isOpen) {
      // Un micro-délai pour s'assurer que le DOM a injecté la modale avant de lancer la transition
      const timer = setTimeout(() => setAnimate(true), 20);
      document.body.style.overflow = 'hidden';
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputCls =
    'w-full bg-white/[.06] border border-white/10 rounded-2xl py-4 px-5 text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500/60 focus:bg-white/10 transition-all';

  const labelCls =
    'block text-[10px] font-black uppercase tracking-[.15em] text-white/30 mb-1.5';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      {/* ── Overlay ── */}
      {/* Animation fluide de l'opacité à l'apparition */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* ── Modal box ── */}
      {/* Animation fluide combinée de l'opacité, de l'échelle (scale) et d'une légère montée (translate-y) */}
      <div 
        className={`relative w-full max-w-md bg-slate-900/95 backdrop-blur-3xl rounded-3xl p-8 border border-white/10 shadow-2xl z-10 transition-all duration-300 ease-out ${
          animate 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition"
        >
          <i className="fa-solid fa-xmark text-sm" />
        </button>

        {/* Header modal */}
        <div className="mb-7">
          <div className="w-12 h-12 bg-red-700/20 rounded-2xl flex items-center justify-center mb-4">
            <i className="fa-solid fa-user-shield text-red-400 text-lg" />
          </div>
          <h3
            className="font-black text-white text-xl"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Espace Agent ANTS
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            Accès restreint au personnel autorisé du CNHU-HKM
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* Matricule */}
          <div>
            <label className={labelCls}>Matricule agent</label>
            <input
              type="text"
              name="matricule"
              value={loginData.matricule}
              onChange={handleChange}
              placeholder="Identifiant unique ANTS"
              className={inputCls}
              required
              autoComplete="username"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className={labelCls}>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={inputCls}
              required
              autoComplete="current-password"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-red-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[.15em] hover:bg-red-800 transition-all shadow-xl shadow-red-900/20 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-arrow-right-to-bracket" />
            Se connecter
          </button>

        </form>

        {/* Note sécurité */}
        <p className="text-[10px] text-center text-white/20 mt-5 leading-relaxed px-4">
          Système de monitoring SANG & VIE. Accès restreint au personnel ANTS autorisé.
        </p>

      </div>
    </div>
  );
};

export default LoginModal;