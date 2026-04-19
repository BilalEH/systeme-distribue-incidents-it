import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';


const IncidentsView = () => {
  const { urls } = useConfig();
  const [incidents, setIncidents] = useState([]);
  
  // Data from other microservices for mapping IDs to Names
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [equipements, setEquipements] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all'); // all, HAUTE, MOYENNE, BASSE

  useEffect(() => {
    fetchIncidents();
    fetchExternalData();
  }, [urls]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${urls.incidents}/api/incidents`);
      if (response.ok) {
        const data = await response.json();
        setIncidents(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Failed to fetch incidents');
      }
    } catch (err) {
      setError('Impossible de se connecter au service Incidents (Port 8081).');
    } finally {
      setLoading(false);
    }
  };

  const fetchExternalData = async () => {
    try {
      const [resUsers, resEquips] = await Promise.all([
        fetch(`${urls.utilisateurs}/utilisateurs`).catch(() => null),
        fetch(`${urls.equipements}/equipements`).catch(() => null)
      ]);

      if (resUsers && resUsers.ok) {
        const usersData = await resUsers.json();
        setUtilisateurs(Array.isArray(usersData) ? usersData : []);
      }
      if (resEquips && resEquips.ok) {
        const equipsData = await resEquips.json();
        setEquipements(Array.isArray(equipsData) ? equipsData : []);
      }
    } catch (e) {
      console.log("Certains services externes sont inaccessibles.");
    }
  };

  const getDemandeurName = (id) => {
    const user = utilisateurs.find(u => u.id === id);
    return user ? `${user.nom || ''} ${user.prenom || ''}`.trim() : `ID: ${id}`;
  };

  const getEquipementName = (id) => {
    const eq = equipements.find(e => e.id === id);
    return eq ? eq.nom : `ID: ${id}`;
  };

  const getPriorityColor = (priorite) => {
    const p = (priorite || '').toUpperCase();
    if (p === 'HAUTE' || p === 'HIGH') return 'bg-red-500/20 text-red-400 border-red-500/50';
    if (p === 'MOYENNE' || p === 'MEDIUM') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    if (p === 'BASSE' || p === 'LOW') return 'bg-green-500/20 text-green-400 border-green-500/50';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  };

  const stats = {
    total: incidents.length,
    haute: incidents.filter(i => (i.priorite || '').toUpperCase() === 'HAUTE').length,
    moyenne: incidents.filter(i => (i.priorite || '').toUpperCase() === 'MOYENNE').length,
    basse: incidents.filter(i => (i.priorite || '').toUpperCase() === 'BASSE').length,
  };

  const filteredIncidents = incidents.filter(inc => {
    if (filter === 'all') return true;
    return (inc.priorite || '').toUpperCase() === filter.toUpperCase();
  });

  return (
    <div className="p-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 transition-all transform animate-fade-in-down ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Déclaration des Incidents</h2>
          <p className="text-gray-400 mt-1">Gérer les tickets et signalements de pannes IT</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-[#1877F2] hover:bg-blue-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nouveau Ticket
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1e1e1e] rounded-xl p-5 border border-gray-700 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full"></div>
          <p className="text-sm text-gray-400 font-medium mb-1">Total Incidents</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-[#1e1e1e] rounded-xl p-5 border border-red-900/50 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full"></div>
          <p className="text-sm text-red-400 font-medium mb-1">Priorité Haute</p>
          <p className="text-3xl font-bold text-red-400">{stats.haute}</p>
        </div>
        <div className="bg-[#1e1e1e] rounded-xl p-5 border border-yellow-900/50 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-500/10 rounded-full"></div>
          <p className="text-sm text-yellow-400 font-medium mb-1">Priorité Moyenne</p>
          <p className="text-3xl font-bold text-yellow-400">{stats.moyenne}</p>
        </div>
        <div className="bg-[#1e1e1e] rounded-xl p-5 border border-green-900/50 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full"></div>
          <p className="text-sm text-green-400 font-medium mb-1">Priorité Basse</p>
          <p className="text-3xl font-bold text-green-400">{stats.basse}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchIncidents} className="px-3 py-1 bg-red-500/20 rounded hover:bg-red-500/30">Réessayer</button>
        </div>
      )}

      {/* Grille d'affichage */}
      <div className="bg-[#151515] rounded-xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-800 flex gap-2 flex-wrap items-center bg-[#1a1a1a]">
          {[
            { key: 'all', label: 'Tous les tickets' },
            { key: 'HAUTE', label: 'Haute Priorité' },
            { key: 'MOYENNE', label: 'Moyenne' },
            { key: 'BASSE', label: 'Basse' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === key ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {loading && incidents.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {[1, 2, 3].map(i => <div key={i} className="h-48 bg-[#1e1e1e] rounded-xl border border-gray-700 animate-pulse"></div>)}
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="py-12 text-center text-gray-500">Aucun incident trouvé.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIncidents.map((inc) => (
                <div key={inc.id} className="bg-[#1e1e1e] rounded-xl p-5 border border-gray-700 hover:border-gray-500 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="pr-2">
                        <span className="text-xs text-gray-500 font-mono">#{inc.id}</span>
                        <h4 className="font-bold text-white text-lg leading-tight mt-1 line-clamp-2" title={inc.titre}>{inc.titre}</h4>
                      </div>
                      <span className={`px-2 py-1 text-[10px] font-black tracking-wider rounded border uppercase ${getPriorityColor(inc.priorite)}`}>
                        {inc.priorite || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-4 line-clamp-2 bg-gray-900/50 p-2 rounded" title={inc.description}>
                      {inc.description}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center border-b border-gray-800 pb-1">
                        <span className="text-gray-500 text-xs uppercase">Catégorie</span>
                        <span className="text-gray-300 font-medium">{inc.categorie}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-800 pb-1">
                        <span className="text-gray-500 text-xs uppercase">Demandeur</span>
                        <span className="text-blue-400 font-medium truncate max-w-[150px]" title={getDemandeurName(inc.demandeurId)}>
                          {getDemandeurName(inc.demandeurId)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-1">
                        <span className="text-gray-500 text-xs uppercase">Matériel</span>
                        <span className="text-purple-400 font-mono text-xs truncate max-w-[150px]" title={getEquipementName(inc.equipementId)}>
                          {getEquipementName(inc.equipementId)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <AddIncidentModal
          utilisateursList={utilisateurs}
          equipementsList={equipements}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchIncidents();
            showToast('Incident déclaré avec succès !');
          }}
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// MODAL D'AJOUT (AVEC COMMUNICATION INTER-SERVICES)
// -------------------------------------------------------------
const AddIncidentModal = ({ utilisateursList, equipementsList, onClose, onSuccess }) => {
  const { urls } = useConfig();
  const [submitting, setSubmitting] = useState(false);
  const [servicesStatus, setServicesStatus] = useState({
    users: utilisateursList.length > 0 ? 'ok' : 'error',
    equipements: equipementsList.length > 0 ? 'ok' : 'error'
  });
  
  // State basé exactement sur le Payload JSON Postman
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    priorite: 'MOYENNE',
    categorie: 'RESEAU',
    demandeurId: utilisateursList.length > 0 ? utilisateursList[0].id : '',
    equipementId: equipementsList.length > 0 ? equipementsList[0].id : ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      titre: formData.titre,
      description: formData.description,
      priorite: formData.priorite,
      categorie: formData.categorie,
      demandeurId: parseInt(formData.demandeurId) || null,
      equipementId: parseInt(formData.equipementId) || null
    };

    try {
      const response = await fetch(`${urls.incidents}/api/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert('Erreur lors de la déclaration de l\'incident');
      }
    } catch (err) {
      alert('Erreur de connexion au service Incidents (Port 8081)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm px-4">
      <div className="bg-[#1e1e1e] rounded-2xl p-6 w-full max-w-lg shadow-2xl relative border border-gray-700">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-1 bg-gray-800 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h3 className="text-2xl font-bold text-white mb-1">Déclarer un Incident</h3>
        <p className="text-sm text-gray-400 mb-6">Veuillez détailler la panne pour faciliter l'intervention.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 ml-1 uppercase tracking-wider">Titre de l'incident</label>
            <input 
              type="text" 
              required 
              placeholder="Ex: Panne réseau salle A12" 
              value={formData.titre} 
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })} 
              className="w-full px-4 py-3 bg-[#151515] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none" 
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 mb-1 ml-1 uppercase tracking-wider">Catégorie</label>
              <select value={formData.categorie} onChange={(e) => setFormData({ ...formData, categorie: e.target.value })} className="w-full px-4 py-3 bg-[#151515] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none appearance-none">
                <option value="RESEAU">Réseau</option>
                <option value="MATERIEL">Matériel (Hardware)</option>
                <option value="LOGICIEL">Logiciel (Software)</option>
                <option value="SERVEUR">Serveur / Base de données</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 mb-1 ml-1 uppercase tracking-wider">Priorité</label>
              <select value={formData.priorite} onChange={(e) => setFormData({ ...formData, priorite: e.target.value })} className="w-full px-4 py-3 bg-[#151515] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none appearance-none">
                <option value="BASSE">Basse (Non urgent)</option>
                <option value="MOYENNE">Moyenne</option>
                <option value="HAUTE">Haute (Critique)</option>
              </select>
            </div>
          </div>

          {/* Séléction croisée : Demandeur (Service 8083) */}
          <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
            <label className="block text-xs font-semibold text-gray-400 mb-2 ml-1 uppercase tracking-wider flex justify-between">
              <span>👤 Demandeur (Service Utilisateurs)</span>
              {servicesStatus.users === 'error' && <span className="text-red-400">Hors Ligne</span>}
            </label>
            {servicesStatus.users === 'ok' ? (
              <select required value={formData.demandeurId} onChange={(e) => setFormData({ ...formData, demandeurId: e.target.value })} className="w-full px-4 py-2.5 bg-[#151515] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                <option value="">Sélectionner l'employé...</option>
                {utilisateursList.map(u => (
                  <option key={u.id} value={u.id}>{u.nom} {u.prenom} (ID: {u.id})</option>
                ))}
              </select>
            ) : (
              <input type="number" required placeholder="ID du Demandeur (Manuel)" value={formData.demandeurId} onChange={(e) => setFormData({ ...formData, demandeurId: e.target.value })} className="w-full px-4 py-2.5 bg-[#151515] border border-red-900/50 rounded-lg text-white focus:border-red-500 focus:outline-none" />
            )}
          </div>

          {/* Séléction croisée : Equipement (Service 8084) */}
          <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
            <label className="block text-xs font-semibold text-gray-400 mb-2 ml-1 uppercase tracking-wider flex justify-between">
              <span>🖥️ Équipement en Panne (Service Équipements)</span>
              {servicesStatus.equipements === 'error' && <span className="text-red-400">Hors Ligne</span>}
            </label>
            {servicesStatus.equipements === 'ok' ? (
              <select required value={formData.equipementId} onChange={(e) => setFormData({ ...formData, equipementId: e.target.value })} className="w-full px-4 py-2.5 bg-[#151515] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                <option value="">Sélectionner le matériel...</option>
                {equipementsList.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.nom} - {eq.categorie}</option>
                ))}
              </select>
            ) : (
              <input type="number" required placeholder="ID de l'équipement (Manuel)" value={formData.equipementId} onChange={(e) => setFormData({ ...formData, equipementId: e.target.value })} className="w-full px-4 py-2.5 bg-[#151515] border border-red-900/50 rounded-lg text-white focus:border-red-500 focus:outline-none" />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 ml-1 uppercase tracking-wider">Description détaillée</label>
            <textarea 
              rows="3" 
              required 
              placeholder="Décrivez les symptômes de la panne..." 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              className="w-full px-4 py-3 bg-[#151515] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none" 
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-lg rounded-xl transition-colors flex justify-center items-center shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {submitting ? 'Enregistrement en cours...' : 'Enregistrer le Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentsView;