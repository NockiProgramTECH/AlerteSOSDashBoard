import React, { useState } from 'react';
import { X, Clock, MapPin, User, AlertTriangle, Play, Image } from 'lucide-react';
import { EmergencyAlert, Agent } from '../types';
import { useAgents, useAssignAgent } from '../hooks/useData';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  PENDING: { color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/40', dot: 'bg-rose-400' },
  ASSIGNED: { color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/40', dot: 'bg-orange-400' },
  IN_PROGRESS: { color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/40', dot: 'bg-blue-400' },
  RESOLVED: { color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/40', dot: 'bg-green-400' },
  REJECTED: { color: 'text-slate-400', bg: 'bg-slate-500/20 border-slate-500/40', dot: 'bg-slate-400' },
};

interface AlertDetailModalProps {
  alert: EmergencyAlert;
  onClose: () => void;
}

const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert: alertData,
  onClose: handleClose,
}: AlertDetailModalProps): React.ReactElement => {
  const alert = alertData;
  const onClose = handleClose;
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [activeMedia, setActiveMedia] = useState<number>(0);
  const { data: agents } = useAgents();
  const assignMutation = useAssignAgent();

  const statusCfg = STATUS_CONFIG[alert.statut as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
  const images = alert.medias.filter((m: any) => m.media_type === 'IMAGE');
  const videos = alert.medias.filter((m: any) => m.media_type === 'VIDEO');

  const handleAssign = async () => {
    if (!selectedAgentId) return toast.error('Sélectionne un agent');
    try {
      await assignMutation.mutateAsync({ alertId: alert.id, agentId: selectedAgentId });
      toast.success('Agent assigné avec succès !');
      onClose();
    } catch {
      toast.error("Erreur lors de l'assignation");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" 
         onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-700">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <AlertTriangle size={20} className="text-rose-400" />
              <h2 className="text-white font-bold text-xl">{alert.type_nom}</h2>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} animate-pulse`} />
              {alert.statut_label}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Infos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3">
              <Clock size={16} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Créée le</p>
                <p className="text-sm text-white font-medium">
                  {new Date(alert.date_creation).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3">
              <MapPin size={16} className="text-rose-400" />
              <div>
                <p className="text-xs text-slate-500">Coordonnées</p>
                <p className="text-sm text-white font-medium font-mono">
                  {alert.location.coordinates[1].toFixed(4)}, {alert.location.coordinates[0].toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Description</p>
            <p className="text-sm text-slate-200">{alert.description || 'Aucune description fournie.'}</p>
          </div>

          {/* Médias */}
          {alert.medias.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Image size={12} /> Médias ({alert.medias.length})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {images.map((media: any, i: number) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 cursor-pointer group">
                    <img
                      src={media.file}
                      alt={`Media ${i}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
                {videos.map((media: any, i: number) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center cursor-pointer group border border-slate-700">
                    <Play size={24} className="text-white" />
                    <span className="absolute bottom-1 right-1 text-xs text-slate-400">Vidéo</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignation */}
          {(alert.statut === 'PENDING' || alert.statut === 'ASSIGNED') && (
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <User size={12} /> Assigner un agent
              </p>
              <div className="flex gap-3">
                <select
                  className="flex-1 bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:border-rose-500 focus:outline-none"
                  value={selectedAgentId ?? ''}
                  onChange={e => setSelectedAgentId(Number(e.target.value))}
                >
                  <option value="">-- Sélectionner un agent --</option>
                  {agents?.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.full_name} ({agent.matricule})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssign}
                  disabled={assignMutation.isPending || !selectedAgentId}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {assignMutation.isPending ? 'Envoi...' : 'Assigner'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertDetailModal;
