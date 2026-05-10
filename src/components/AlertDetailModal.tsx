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
  loading?: boolean;
}

const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  onClose,
  loading = false,
}: AlertDetailModalProps): React.ReactElement => {
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [activeMedia, setActiveMedia] = useState<number>(0);
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const { data: agents } = useAgents();
  const assignMutation = useAssignAgent();

  const statusCfg = STATUS_CONFIG[alert.statut as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
  const typeName = alert.type_nom || alert.type_alerte_info?.nom || 'Alerte';
  const senderName =`${alert.emetteur_info?.first_name} ${alert.emetteur_info?.last_name}`
    
  || [alert.emetteur_info?.first_name, alert.emetteur_info?.last_name].filter(Boolean).join(' ')
    || alert.emetteur_info?.full_name
    || `ID ${alert.emetteur ?? 'inconnu'}`;
    const senderCNIB =alert.emetteur_info?.numero_cnib?.toUpperCase()
  const medias = alert.medias ?? [];
  const images = medias.filter((m: any) => m.media_type === 'IMAGE');
  const videos = medias.filter((m: any) => m.media_type === 'VIDEO');
  const activeMediaItem = medias[activeMedia];

  const openMediaViewer = (index: number) => {
    setActiveMedia(index);
    setMediaViewerOpen(true);
  };

  const closeMediaViewer = () => {
    setMediaViewerOpen(false);
  };

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

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-8 shadow-2xl text-center text-white" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p>Chargement des détails...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" 
         onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-[10000] bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-700">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <AlertTriangle size={20} className="text-rose-400" />
              <h2 className="text-white font-bold text-xl">{typeName}</h2>
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

          {/* Émetteur */}
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Émetteur</p>
            <p className="text-sm text-slate-200">{senderName}</p>
             <p className="text-sm text-slate-200">N°CNIB:{senderCNIB}</p>
          </div>

          {/* Description */}
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Description</p>
            <p className="text-sm text-slate-200">{alert.description || 'Aucune description fournie.'}</p>
          </div>

          {/* Médias */}
          {medias.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Image size={12} /> Médias ({medias.length})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {medias.map((media: any, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => openMediaViewer(i)}
                    className={`relative aspect-square rounded-lg overflow-hidden bg-slate-800 cursor-pointer group border ${activeMedia === i ? 'border-rose-500' : 'border-transparent'} focus:outline-none`}
                  >
                    {media.media_type === 'IMAGE' ? (
                      <img
                        src={media.file}
                        alt={`Media ${i}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400">
                        <Play size={28} />
                      </div>
                    )}
                    {media.media_type === 'VIDEO' && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] rounded px-2 py-1">
                        VIDEO
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          {mediaViewerOpen && activeMediaItem && (
            <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/90 p-4" onClick={closeMediaViewer}>
              <div className="absolute inset-0" />
              <div className="relative w-full max-w-5xl max-h-full bg-slate-950 rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={closeMediaViewer}
                  className="absolute top-4 right-4 z-20 rounded-full bg-black/60 p-2 text-white hover:bg-black"
                >
                  <X size={20} />
                </button>
                {activeMediaItem.media_type === 'VIDEO' ? (
                  <video
                    className="w-full max-h-[80vh] aspect-video object-contain bg-black"
                    controls
                    playsInline
                    muted={false}
                    preload="metadata"
                  >
                    <source src={activeMediaItem.file} />
                    Votre navigateur ne prend pas en charge la lecture vidéo.
                  </video>
                ) : (
                  <img
                    src={activeMediaItem.file}
                    alt="Aperçu média"
                    className="w-full max-h-[80vh] object-contain bg-black"
                  />
                )}
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
