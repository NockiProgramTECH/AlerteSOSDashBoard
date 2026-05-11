import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Download, LogIn, Info, ArrowLeft, Smartphone, Globe } from 'lucide-react';

const HelpPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">SOS<span className="text-rose-400">ALERTE</span></p>
              <p className="text-slate-500 text-xs">Guide d'utilisation</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
        </div>

        <div className="space-y-6">
          {/* Project Info */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Info className="text-rose-500" size={24} />
              <h2 className="text-xl font-bold">À propos du projet</h2>
            </div>
            <p className="text-slate-400 leading-relaxed">
              SOSAlerte est une plateforme intégrée de gestion des urgences conçue pour le Burkina Faso. 
              Elle permet une communication en temps réel entre les citoyens et les services de secours 
              (Sapeurs-Pompiers, Police, Gendarmerie, SAMU). 
              Le système se compose d'une application mobile pour le signalement par les citoyens et d'un 
              tableau de bord web pour la coordination des interventions par les dispatchers.
            </p>
          </section>

          {/* Mobile App */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="text-blue-500" size={24} />
              <h2 className="text-xl font-bold">Application Mobile</h2>
            </div>
            <p className="text-slate-400 mb-6">
              Téléchargez l'application mobile pour signaler des incidents instantanément avec votre position GPS, des photos et des vidéos.
            </p>
            <a
              href="https://raw.githubusercontent.com/NockiProgramTECH/AlerteSOSMobile/main/AlerteSOS.apk"
              download 

              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
            >
              <Download size={20} />
              Télécharger l'APK (Android)
            </a>
          </section>

          {/* Login Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Web Access */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="text-emerald-500" size={20} />
                <h3 className="font-bold text-lg">Accès Web (Dispatcher)</h3>
              </div>
              <p className="text-slate-500 text-sm mb-4">Pour tester le tableau de bord de coordination :</p>
              <div className="bg-slate-950 rounded-xl p-4 space-y-2 border border-slate-800">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Utilisateur:</span>
                  <span className="text-emerald-400 font-mono">admin_pompier</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Mot de passe:</span>
                  <span className="text-emerald-400 font-mono">pompier2026</span>
                </div>
              </div>
            </section>

            {/* Mobile Access */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="text-orange-500" size={20} />
                <h3 className="font-bold text-lg">Accès Mobile (Citoyen)</h3>
              </div>
              <p className="text-slate-500 text-sm mb-4">Pour tester l'application mobile sans inscription :</p>
              <div className="bg-slate-950 rounded-xl p-4 space-y-2 border border-slate-800">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Utilisateur:</span>
                  <span className="text-orange-400 font-mono">citoyen_test</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Mot de passe:</span>
                  <span className="text-orange-400 font-mono">citoyen2026</span>
                </div>
              </div>
            </section>
          </div>

          <p className="text-center text-slate-600 text-xs mt-8">
            SOSAlerte © 2026 — Système de Gestion des Urgences au Burkina Faso
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
