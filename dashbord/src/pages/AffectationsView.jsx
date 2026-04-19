import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';

const AffectationsView = () => {
  const { urls } = useConfig();
  const [affectations, setAffectations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [closingId, setClosingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAffectations();
  }, [urls]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAffectations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${urls.affectation}/api/affectations`);
      if (response.ok) {
        const data = await response.json();
        setAffectations(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Failed to fetch affectations');
      }
    } catch (err) {
      setError('Impossible de se connecter au service Affectations. Vérifiez si le PC est allumé.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const response = await fetch(`${urls.affectation}/api/affectations/${id}/statut`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          statut: newStatus,
          commentaire: 'Statut mis à jour via Dashboard'
        })
      });

      if (response.ok) {
        await fetchAffectations();
        showToast('Statut mis à jour avec succès !');
      } else {
        showToast('Erreur lors de la modification du statut', 'error');
      }
    } catch (err) {
      showToast('Erreur de connexion', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const closeAffectation = async (id) => {
    setClosingId(id);
    try {
      const response = await fetch(`${urls.affectation}/api/affectations/${id}/cloturer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          commentaire: 'Incident clôturé via Dashboard'
        })
      });

      if (response.ok) {
        await fetchAffectations();
        showToast('Affectation clôturée avec succès !');
      } else {
        showToast('Erreur lors de la clôture', 'error');
      }
    } catch (err) {
      showToast('Erreur de connexion', 'error');
    } finally {
      setClosingId(null);
    }
  };

  const stats = {
    total: affectations.length,
    enCours: affectations.filter(a => {
      const status = a.status?.toUpperCase() || a.statut?.toUpperCase();
      return status === 'EN_COURS' || status === 'EN_COUR' || status === 'IN_PROGRESS';
    }).length,
    resolu: affectations.filter(a => {
      const status = a.status?.toUpperCase() || a.statut?.toUpperCase();
      return status === 'RESOLU' || status === 'RESOLVED';
    }).length,
    cloture: affectations.filter(a => {
      const status = a.status?.toUpperCase() || a.statut?.toUpperCase();
      return status === 'CLOTURE' || status === 'CLOSED' || status === 'CLÔTURÉ';
    }).length,
  };

  const getStatusDisplay = (status) => {
    if (!status) return 'INCONNU';
    return status.toUpperCase();
  };

  const getStatusColor = (status) => {
    const statusUpper = getStatusDisplay(status);
    const colors = {
      'EN_COURS': 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
      'EN_COUR': 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
      'IN_PROGRESS': 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
      'RESOLU': 'bg-green-500/20 text-green-400 border-green-500',
      'RESOLVED': 'bg-green-500/20 text-green-400 border-green-500',
      'CLOTURE': 'bg-gray-500/20 text-gray-400 border-gray-500',
      'CLOSED': 'bg-gray-500/20 text-gray-400 border-gray-500',
      'CLÔTURÉ': 'bg-gray-500/20 text-gray-400 border-gray-500',
      'OUVERT': 'bg-blue-500/20 text-blue-400 border-blue-500',
      'OPEN': 'bg-blue-500/20 text-blue-400 border-blue-500',
      'NOUVEAU': 'bg-purple-500/20 text-purple-400 border-purple-500',
      'NEW': 'bg-purple-500/20 text-purple-400 border-purple-500',
    };
    return colors[statusUpper] || 'bg-gray-500/20 text-gray-400 border-gray-500';
  };

  const filteredAffectations = affectations.filter(a => {
    if (filter === 'all') return true;
    const status = getStatusDisplay(a.status || a.statut);
    switch (filter) {
      case 'en_cours': return status === 'EN_COURS' || status === 'EN_COUR' || status === 'IN_PROGRESS';
      case 'resolu': return status === 'RESOLU' || status === 'RESOLVED';
      case 'cloture': return status === 'CLOTURE' || status === 'CLOSED' || status === 'CLÔTURÉ';
      default: return true;
    }
  });

  if (loading && affectations.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-64"></div>
          <div className="h-4 bg-gray-700 rounded w-48"></div>
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-800 rounded-xl"></div>)}
          </div>
          <div className="h-96 bg-gray-800 rounded-xl mt-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      {toast && (
        <div className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 transition-all transform animate-fade-in-down ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Affectations & Traitement</h2>
          <p className="text-gray-400 mt-1">Gérer les affectations de tickets aux techniciens</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all flex items-center gap-2"
        >
          Nouvelle Affectation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1e1e1e] rounded-xl p-5 border border-gray-700 shadow-sm relative overflow-hidden">
          <p className="text-sm text-gray-400 font-medium mb-1">Total Affectations</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-[#1e1e1e] rounded-xl p-5 border border-yellow-900/50 shadow-sm relative overflow-hidden">
          <p className="text-sm text-yellow-400 font-medium mb-1">En Cours</p>
          <p className="text-3xl font-bold text-yellow-400">{stats.enCours}</p>
        </div>
        <div className="bg-[#1e1e1e] rounded-xl p-5 border border-green-900/50 shadow-sm relative overflow-hidden">
          <p className="text-sm text-green-400 font-medium mb-1">Résolu</p>
          <p className="text-3xl font-bold text-green-400">{stats.resolu}</p>
        </div>
        <div className="bg-[#1e1e1e] rounded-xl p-5 border border-gray-900/50 shadow-sm relative overflow-hidden">
          <p className="text-sm text-gray-400 font-medium mb-1">Clôturé</p>
          <p className="text-3xl font-bold text-gray-400">{stats.cloture}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex gap-2 flex-wrap items-center">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'en_cours', label: 'En Cours' },
            { key: 'resolu', label: 'Résolus' },
            { key: 'cloture', label: 'Clôturés' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === key ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-400">
            <span>Total:</span>
            <span className="text-white font-medium">{filteredAffectations.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Incident</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Technicien</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Équipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Commentaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredAffectations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Aucune affectation trouvée</td>
                </tr>
              ) : (
                filteredAffectations.map((affectation) => {
                  const statusDisplay = affectation.status || affectation.statut || 'INCONNU';
                  const isUpdating = updatingId === affectation.id;
                  const isClosing = closingId === affectation.id;

                  return (
                    <tr key={affectation.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-cyan-400">#{affectation.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{affectation.incidentId || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{affectation.technicienId || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{affectation.equipeId || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isUpdating ? (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-blue-500/20 text-blue-400 animate-pulse">Mise à jour...</span>
                        ) : (
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(statusDisplay)}`}>
                            {statusDisplay.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{affectation.commentaire || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {!isUpdating && (
                            <select
                              value={statusDisplay}
                              onChange={(e) => updateStatus(affectation.id, e.target.value)}
                              className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                              <option value="NOUVEAU">Nouveau</option>
                              <option value="OUVERT">Ouvert</option>
                              <option value="EN_COURS">En Cours</option>
                              <option value="RESOLU">Résolu</option>
                            </select>
                          )}
                          {isClosing ? (
                            <span className="px-2 py-1 text-xs font-medium rounded bg-gray-500/20 text-gray-400 animate-pulse">Clôture...</span>
                          ) : (
                            <button
                              onClick={() => closeAffectation(affectation.id)}
                              className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500 rounded text-xs hover:bg-red-500/30 transition-colors"
                            >
                              Clôturer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <AddAffectationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchAffectations();
            showToast('Affectation créée avec succès !');
          }}
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// LE NOUVEAU MODAL AVEC COMMUNICATION INTER-SERVICES
// -------------------------------------------------------------
const AddAffectationModal = ({ onClose, onSuccess }) => {
  const { urls } = useConfig();
  
  // State pour stocker les données qui viennent des autres microservices
  const [incidentsList, setIncidentsList] = useState([]);
  const [techniciensList, setTechniciensList] = useState([]);
  const [equipesList, setEquipesList] = useState([]);
  
  // State pour gérer les chargements et les erreurs de chaque service
  const [loadingData, setLoadingData] = useState(true);
  const [servicesStatus, setServicesStatus] = useState({
    incidents: 'ok', // 'ok', 'loading', 'error'
    utilisateurs: 'ok'
  });

  const [formData, setFormData] = useState({
    incidentId: '',
    technicienId: '',
    equipeId: '',
    commentaire: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetching des données des autres services au moment de l'ouverture du Modal
  useEffect(() => {
    const fetchExternalData = async () => {
      setLoadingData(true);
      
      // 1. Fetch Incidents (Depuis le microservice Incidents)
      try {
        const resIncidents = await fetch(`${urls.incidents}/api/incidents`);
        if (resIncidents.ok) {
          const data = await resIncidents.json();
          setIncidentsList(Array.isArray(data) ? data : []);
        } else throw new Error();
      } catch (e) {
        setServicesStatus(prev => ({ ...prev, incidents: 'error' }));
      }

      // 2. Fetch Techniciens & Equipes (Depuis le microservice Utilisateurs)
      try {
        // Supposons que l'API pour les techniciens est /api/utilisateurs (à adapter si besoin)
        const resTech = await fetch(`${urls.utilisateurs}/utilisateurs`);
        if (resTech.ok) {
          const data = await resTech.json();
          // On filtre seulement les techniciens si le backend renvoie tout
          const techs = Array.isArray(data) ? data.filter(u => u.role === 'TECHNICIEN' || u.role === 'technicien' || u.type === 'TECHNICIEN') : [];
          // Si le backend renvoie déjà juste les techniciens, utilisez : setTechniciensList(data);
          setTechniciensList(techs.length > 0 ? techs : Array.isArray(data) ? data : []); 
        } else throw new Error();
        
        // Fetch Equipes (Supposons /equipes)
        const resEq = await fetch(`${urls.utilisateurs}/equipes`);
        if (resEq.ok) {
          const dataEq = await resEq.json();
          setEquipesList(Array.isArray(dataEq) ? dataEq : []);
        }
      } catch (e) {
        setServicesStatus(prev => ({ ...prev, utilisateurs: 'error' }));
      }

      setLoadingData(false);
    };

    fetchExternalData();
  }, [urls]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      incidentId: parseInt(formData.incidentId) || null,
      technicienId: parseInt(formData.technicienId) || null,
      equipeId: parseInt(formData.equipeId) || null,
      commentaire: formData.commentaire || '',
    };

    try {
      const response = await fetch(`${urls.affectation}/api/affectations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert('Erreur lors de la création de l\'affectation');
      }
    } catch (err) {
      alert('Erreur de connexion au service Affectations');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm px-4">
      <div className="bg-[#1e1e1e] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">✕</button>

        <h3 className="text-xl font-bold text-white mb-6">Nouvelle Affectation</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sélection de l'Incident */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1 flex justify-between">
              <span>Incident à traiter</span>
              {servicesStatus.incidents === 'error' && <span className="text-red-400 text-xs">Service hors ligne</span>}
            </label>
            <select
              required
              value={formData.incidentId}
              onChange={(e) => setFormData({ ...formData, incidentId: e.target.value })}
              className={`w-full px-4 py-3 bg-[#1e1e1e] border rounded-lg text-white focus:outline-none appearance-none ${servicesStatus.incidents === 'error' ? 'border-red-500/50 opacity-50' : 'border-gray-600 focus:border-blue-500'}`}
              disabled={loadingData || servicesStatus.incidents === 'error'}
            >
              <option value="">
                {loadingData ? 'Chargement des incidents...' : 
                 servicesStatus.incidents === 'error' ? 'Impossible de récupérer les incidents' : 
                 'Sélectionner un incident...'}
              </option>
              {incidentsList.map(inc => (
                <option key={inc.id} value={inc.id}>#{inc.id} - {inc.titre || inc.description || 'Incident sans titre'}</option>
              ))}
            </select>
          </div>

          {/* Sélection du Technicien */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1 flex justify-between">
              <span>Assigner au Technicien</span>
              {servicesStatus.utilisateurs === 'error' && <span className="text-red-400 text-xs">Service hors ligne</span>}
            </label>
            <select
              value={formData.technicienId}
              onChange={(e) => setFormData({ ...formData, technicienId: e.target.value })}
              className={`w-full px-4 py-3 bg-[#1e1e1e] border rounded-lg text-white focus:outline-none appearance-none ${servicesStatus.utilisateurs === 'error' ? 'border-red-500/50 opacity-50' : 'border-gray-600 focus:border-blue-500'}`}
              disabled={loadingData || servicesStatus.utilisateurs === 'error'}
            >
              <option value="">
                {loadingData ? 'Chargement des techniciens...' : 
                 servicesStatus.utilisateurs === 'error' ? 'Saisie manuelle requise (Service down)' : 
                 'Sélectionner un technicien...'}
              </option>
              {techniciensList.map(tech => (
                <option key={tech.id} value={tech.id}>{tech.nom || tech.name || `Technicien #${tech.id}`}</option>
              ))}
            </select>
          </div>

          {/* Sélection de l'Équipe */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1 flex justify-between">
              <span>Ou assigner à une Équipe</span>
            </label>
            <select
              value={formData.equipeId}
              onChange={(e) => setFormData({ ...formData, equipeId: e.target.value })}
              className={`w-full px-4 py-3 bg-[#1e1e1e] border rounded-lg text-white focus:outline-none appearance-none ${servicesStatus.utilisateurs === 'error' ? 'border-red-500/50 opacity-50' : 'border-gray-600 focus:border-blue-500'}`}
              disabled={loadingData || servicesStatus.utilisateurs === 'error'}
            >
              <option value="">
                {loadingData ? 'Chargement des équipes...' : 
                 servicesStatus.utilisateurs === 'error' ? 'Saisie manuelle requise (Service down)' : 
                 'Sélectionner une équipe...'}
              </option>
              {equipesList.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.nom || eq.name || `Équipe #${eq.id}`}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Choisissez un technicien OU une équipe.</p>
          </div>

          {/* Fallback : Si le service utilisateur est down, on affiche des inputs manuels */}
          {servicesStatus.utilisateurs === 'error' && (
            <div className="flex gap-2">
               <input
                  type="number"
                  placeholder="ID Tech manuel"
                  value={formData.technicienId}
                  onChange={(e) => setFormData({ ...formData, technicienId: e.target.value })}
                  className="w-1/2 px-3 py-2 bg-gray-800 border border-red-500/50 rounded text-white text-sm"
               />
               <input
                  type="number"
                  placeholder="ID Equipe manuel"
                  value={formData.equipeId}
                  onChange={(e) => setFormData({ ...formData, equipeId: e.target.value })}
                  className="w-1/2 px-3 py-2 bg-gray-800 border border-red-500/50 rounded text-white text-sm"
               />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Commentaire</label>
            <textarea
              rows="3"
              placeholder="Détails de l'affectation..."
              value={formData.commentaire}
              onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
              className="w-full px-4 py-3 bg-[#1e1e1e] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none placeholder-gray-400 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || loadingData || (!formData.incidentId && servicesStatus.incidents !== 'error')}
              className="w-full py-3 bg-[#1877F2] hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Création en cours...' : 'Créer l\'affectation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AffectationsView;