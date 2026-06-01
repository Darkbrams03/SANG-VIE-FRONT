import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import AOS from 'aos';
import 'aos/dist/aos.css';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import StatsSection from '../components/StatsSection';
import ProcessSection from '../components/ProcessSection';
import BloodStocks from '../components/BloodStocks';
import BloodCenters from '../components/BloodCenters';
import DonorRegistration from '../components/DonorRegistration';
import LoginModal from '../components/LoginModal';
import Footer from '../components/Footer';
import UrgencyBanner from '../components/UrgencyBanner';


const API = 'https://sang-vie-back-rfmj.onrender.com/api';

const Home = () => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);

  const [formData, setFormData] = useState({
    fullname:    '',
    blood_group: '',
    phone:       '',
    city:        '',
  });

  const [loginData, setLoginData] = useState({
    matricule: '',
    password:  '',
  });


  useEffect(() => {
    AOS.init({
      duration: 1000,      // Durée de l'animation en millisecondes (1 seconde)
      once: false,         // Mettre à true si tu veux que l'animation ne se joue QU'UNE seule fois. Si false, elle se rejoue à chaque scroll haut/bas.
      mirror: false,       // Évite que les éléments s'animent à l'envers en remontant
      offset: 120,         // Déclenche l'animation 120px avant que l'élément n'apparaisse à l'écran
      easing: 'ease-out-cubic', // Transition fluide
    });
  }, []);

  // ── Alerte active ──
  useEffect(() => {
    axios.get(`${API}/current-alert`)
      .then(res => { if (res.data?.is_active) setActiveAlert(res.data); })
      .catch(() => {});
  }, []);

  // ── Alerte active ──
  useEffect(() => {
    axios.get(`${API}/current-alert`)
      .then(res => { if (res.data?.is_active) setActiveAlert(res.data); })
      .catch(() => {});
  }, []);

  // ── Inscription donneur ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/donors`, formData);
      if (res.status === 201) {
        setIsSubmitted(true);
        setFormData({ fullname: '', blood_group: '', phone: '', city: '' });
      }
    } catch (err) {
      if (err.response?.status === 422) {
        alert("Ce numéro de téléphone est déjà enregistré.");
      } else {
        alert("Une erreur est survenue. Réessayez plus tard.");
      }
    }
  };

  // ── Connexion agent ──
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/login`, {
        matricule: loginData.matricule,
        password:  loginData.password,
      });

      if (res.data.token) {
        localStorage.setItem('ACCESS_TOKEN', res.data.token);
        localStorage.setItem('USER_DATA', JSON.stringify(res.data.user));
        setIsModalOpen(false);
        navigate(res.data.user.role === 'admin' ? '/admin' : '/agent');
      }
    } catch (err) {
      alert(err.response?.data?.message || "Identifiants invalides.");
    }
  };

  // Scroll vers la section don
  const scrollToDon = () => {
    document.getElementById('devenir-donneur')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-white overflow-x-hidden">

      <Navbar onOpenLogin={() => setIsModalOpen(true)} />

      {/* Hero + bannière urgence dans le même conteneur flex
          La bannière pousse le Hero vers le bas sans casser la hauteur */}
      <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 72px)' }}>
        <UrgencyBanner alert={activeAlert} onDonate={scrollToDon} />
        <div className="flex-1">
          <Hero />
        </div>
      </div>

      <div data-aos="fade-up">
        <StatsSection />
      </div>
     

    
        <BloodStocks />
     


     <div data-aos="fade-left">
        <BloodCenters />
      </div>

      
      <ProcessSection />

      <DonorRegistration
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        isSubmitted={isSubmitted}
      />

      <Footer />

      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        loginData={loginData}
        setLoginData={setLoginData}
        handleLogin={handleLogin}
      />

    </div>
  );
};

export default Home;