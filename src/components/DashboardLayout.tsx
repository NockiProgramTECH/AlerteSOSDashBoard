import React, { useState } from 'react';
import {
  LayoutDashboard, Bell, Truck, Map, History,
  BarChart3, MessageSquare, Settings, ChevronDown,
  Search, Filter, Plus, AlertTriangle, Clock,
  CheckCircle, Users, TrendingUp, RefreshCw
} from 'lucide-react';
import { useAlerts, useMe } from '../hooks/useData';
import { EmergencyAlert } from '../types';
import AlertMap from './AlertMap';
import AlertDetailModal from './AlertDetailModal';

// ── Helpers ──────────────────────────────────────────
const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h${mins % 60}`;
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  ASSIGNED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  RESOLVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const ALERT_ICON_BG: Record<string, string> = {
  PENDING: 'bg-rose-500',
  ASSIGNED: 'bg-orange-500',
  IN_PROGRESS: 'bg-blue-500',
  RESOLVED: 'bg-green-500',
  REJECTED: 'bg-slate-600',
};

// ── Sidebar Nav ───────────────────────────────────────
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Tableau de bord', active: true },
  { icon: Bell, label: 'Alertes', badge: true },
  { icon: Truck, label: 'Interventions' },
  { icon: Users, label: 'Agents' },
  { icon: Map, label: 'Carte' },
  { icon: History, label: 'Historique' },
  { icon: BarChart3, label: 'Statistiques' },
  { icon: MessageSquare, label: 'Messages' },
  { icon: Settings, label: 'Paramètres' },
];

// ── KPI Card ──────────────────────────────────────────
interface KpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  sub: string;
  onClick?: () => void;
}
const KpiCard: React.FC<KpiCardProps> = ({ icon, iconBg, label, value, sub, onClick }) => (
  <div
    className={`bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:border-slate-500 transition-colors' : ''}`}
    onClick={onClick}
  >
    <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">{label}</p>
      <p className="text-white text-3xl font-bold leading-none my-0.5">{value}</p>
      <p className="text-slate-500 text-xs">{sub}</p>
    </div>
  </div>
);

// ── Alert Row (sidebar) ────────────────────────────────
interface AlertRowProps {
  alert: EmergencyAlert;
  onSelect: () => void;
}
const AlertRow: React.FC<AlertRowProps> = ({ alert, onSelect }) => (
  <div
    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-700/50 cursor-pointer transition-colors group border border-transparent hover:border-slate-700"
    onClick={onSelect}
  >
    <div className={`w-9 h-9 rounded-lg ${ALERT_ICON_BG[alert.statut] || 'bg-rose-500'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
      <AlertTriangle size={16} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white text-sm font-semibold truncate">{alert.type_nom}</p>
      <p className="text-slate-400 text-xs truncate">{alert.description?.slice(0, 50) || 'Aucune description'}</p>
      <div className="flex items-center gap-2 mt-1">
        <Clock size={10} className="text-slate-500" />
        <span className="text-slate-500 text-xs">{timeAgo(alert.date_creation)}</span>
        <span className={`px-1.5 py-0.5 rounded text-xs border ${STATUS_BADGE[alert.statut]}`}>
          {alert.statut_label}
        </span>
      </div>
    </div>
  </div>
);

// ══ DASHBOARD LAYOUT ══════════════════════════════════
const DashboardLayout: React.FC = () => {
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  const [detailAlert, setDetailAlert] = useState<EmergencyAlert | null>(null);
  const [search, setSearch] = useState('');

  const { data: alerts = [], isLoading, refetch } = useAlerts();
  const { data: user } = useMe();

  // Filtres
  const pendingAlerts = alerts.filter(a => a.statut === 'PENDING');
  const activeAlerts = alerts.filter(a => ['PENDING', 'ASSIGNED', 'IN_PROGRESS'].includes(a.statut));
  const inProgressAlerts = alerts.filter(a => a.statut === 'IN_PROGRESS');
  const resolvedAlerts = alerts.filter(a => a.statut === 'RESOLVED');

  const filteredAlerts = alerts.filter(a =>
    a.type_nom.toLowerCase().includes(search.toLowerCase()) ||
    a.description?.toLowerCase().includes(search.toLowerCase())
  );

  const structureLabel = user?.structure_type === 'POMPIERS' ? 'Sapeurs Pompiers' :
                         user?.structure_type === 'POLICE' ? 'Police Nationale' : 'Structure';

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans">
      {/* ── SIDEBAR ──────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-800">
        {/* Logo */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">ALERT</p>
              <p className="text-rose-400 font-bold text-sm leading-none">SAPEUR</p>
            </div>
          </div>
          {user && (
            <p className="text-slate-500 text-xs mt-2 truncate">{structureLabel}</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                item.active
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon size={16} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && pendingAlerts.length > 0 && (
                <span className="bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {pendingAlerts.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white text-xs font-bold">
              {user?.full_name?.charAt(0) || 'D'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.full_name || 'Dispatcher'}</p>
              <p className="text-slate-500 text-xs">Dispatcher</p>
            </div>
            <ChevronDown size={14} className="text-slate-500" />
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center gap-4 px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex-shrink-0">
          <div>
            <h1 className="text-white font-bold text-lg leading-none">Tableau de bord</h1>
            <p className="text-slate-500 text-xs">Vue d'ensemble en temps réel</p>
          </div>
          <div className="flex-1 max-w-xs ml-4 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher une alerte..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white text-sm transition-colors"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Actualiser
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white text-sm transition-colors">
              <Filter size={14} />
              Filtres
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-lg text-white text-sm font-semibold transition-colors">
              <Plus size={14} />
              Nouvelle alerte
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Center Panel */}
          <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
            {/* KPI Row */}
            <div className="grid grid-cols-4 gap-3 flex-shrink-0">
              <KpiCard
                icon={<Bell size={20} className="text-white" />}
                iconBg="bg-rose-600"
                label="Alertes en cours"
                value={pendingAlerts.length}
                sub="Voir toutes →"
              />
              <KpiCard
                icon={<Truck size={20} className="text-white" />}
                iconBg="bg-blue-600"
                label="Interventions"
                value={inProgressAlerts.length}
                sub="En cours"
              />
              <KpiCard
                icon={<CheckCircle size={20} className="text-white" />}
                iconBg="bg-green-600"
                label="Résolues"
                value={resolvedAlerts.length}
                sub="Ce mois"
              />
              <KpiCard
                icon={<TrendingUp size={20} className="text-white" />}
                iconBg="bg-orange-500"
                label="Total alertes"
                value={alerts.length}
                sub="Toutes périodes"
              />
            </div>

            {/* Map */}
            <div className="flex-1 rounded-xl overflow-hidden border border-slate-700 min-h-0">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Chargement de la carte...</p>
                  </div>
                </div>
              ) : (
                <AlertMap
                  alerts={filteredAlerts}
                  selectedAlert={selectedAlert}
                  onAlertSelect={(alert) => {
                    setSelectedAlert(alert);
                    setDetailAlert(alert);
                  }}
                />
              )}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ──────────────────────────── */}
          <aside className="w-72 flex-shrink-0 flex flex-col border-l border-slate-800 bg-slate-900/30 overflow-hidden">
            {/* Alertes en cours */}
            <div className="flex-1 flex flex-col overflow-hidden border-b border-slate-800">
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
                <h3 className="text-white text-xs font-bold uppercase tracking-wider">
                  Alertes en cours
                </h3>
                <button className="text-rose-400 text-xs hover:text-rose-300 transition-colors">
                  Voir tout →
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : activeAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Aucune alerte active</p>
                  </div>
                ) : (
                  activeAlerts.map(alert => (
                    <AlertRow
                      key={alert.id}
                      alert={alert}
                      onSelect={() => {
                        setSelectedAlert(alert);
                        setDetailAlert(alert);
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Interventions en cours */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
                <h3 className="text-white text-xs font-bold uppercase tracking-wider">
                  Interventions en cours
                </h3>
                <button className="text-rose-400 text-xs hover:text-rose-300 transition-colors">
                  Voir tout →
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                {inProgressAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck size={24} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Aucune intervention</p>
                  </div>
                ) : (
                  inProgressAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 cursor-pointer transition-colors border border-transparent hover:border-slate-700"
                      onClick={() => setDetailAlert(alert)}
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <Truck size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{alert.type_nom}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-slate-400 text-xs truncate">{alert.statut_label}</p>
                          <span className="text-blue-400 text-xs font-semibold">En route</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-slate-800">
                <button className="w-full py-2.5 text-sm text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-xl transition-colors">
                  Voir toutes les interventions
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ── MODAL DÉTAIL ─────────────────────────────── */}
      {detailAlert && (
        <AlertDetailModal
          alert={detailAlert}
          onClose={() => setDetailAlert(null)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
