import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';


const UtilisateursView = () => {
  const { urls } = useConfig();
  const [activeTab, setActiveTab] = useState('utilisateurs'); // 'utilisateurs', 'techniciens', 'equipes'
  
  const [data, setData] = useState({
    utilisateurs: [],
    techniciens: [],
    equipes: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking'); // 'online', 'offline', 'checking'
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    checkHealth();
    fetchAllData();
  }, [urls]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. API: GET /utilisateurs/sante
  const checkHealth = async () => {
    try {
      const res = await fetch(`${urls.utilisateurs}/api/utilisateurs/sante`);
      const healthRes = await fetch(`${urls.utilisateurs}/utilisateurs/sante`);
      if (healthRes.ok) setServerStatus('online');
      else setServerStatus('offline');
    } catch (e) {
      setServerStatus('offline');
    }
  };

  // 2. API: GET (All)
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resUsers, resTechs, resEquipes] = await Promise.all([
        fetch(`${urls.utilisateurs}/utilisateurs`),
        fetch(`${urls.utilisateurs}/techniciens`),
        fetch(`${urls.utilisateurs}/equipes`)
      ]);

      const [users, techs, equipes] = await Promise.all([
        resUsers.ok ? resUsers.json() : [],
        resTechs.ok ? resTechs.json() : [],
        resEquipes.ok ? resEquipes.json() : []
      ]);

      setData({
        utilisateurs: Array.isArray(users) ? users : [],
        techniciens: Array.isArray(techs) ? techs : [],
        equipes: Array.isArray(equipes) ? equipes : []
      });
    } catch (err) {
      setError('Erreur de connexion au service Utilisateurs. Vérifiez que le serveur est lancé.');
      setServerStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  const currentDataList = data[activeTab] || [];

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
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-white">Ressources Humaines</h2>
            {/* Status Badge (Santé du serveur) */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              serverStatus === 'online' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
              serverStatus === 'checking' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
              'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${serverStatus === 'online' ? 'bg-green-400 animate-pulse' : serverStatus === 'checking' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
              {serverStatus === 'online' ? 'Serveur En Ligne' : serverStatus === 'checking' ? 'Vérification...' : 'Serveur Hors Ligne'}
            </div>
          </div>
          <p className="text-gray-400 mt-1">Gérer les utilisateurs, techniciens et équipes d'intervention</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          disabled={serverStatus === 'offline'}
          className="px-5 py-2.5 bg-[#1877F2] hover:bg-blue-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          + Ajouter {activeTab === 'utilisateurs' ? 'Utilisateur' : activeTab === 'techniciens' ? 'Technicien' : 'Équipe'}
        </button>
      </div>

      {/* Barre de Statistiques (Tabs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div 
          className={`bg-[#1e1e1e] rounded-xl p-5 border cursor-pointer transition-all ${activeTab === 'utilisateurs' ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] scale-[1.02]' : 'border-gray-700 hover:border-gray-500 opacity-70 hover:opacity-100'}`} 
          onClick={() => setActiveTab('utilisateurs')}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 font-medium mb-1">Total Utilisateurs</p>
              <p className="text-3xl font-bold text-white">{data.utilisateurs.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">👤</div>
          </div>
        </div>
        
        <div 
          className={`bg-[#1e1e1e] rounded-xl p-5 border cursor-pointer transition-all ${activeTab === 'techniciens' ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.15)] scale-[1.02]' : 'border-gray-700 hover:border-gray-500 opacity-70 hover:opacity-100'}`} 
          onClick={() => setActiveTab('techniciens')}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 font-medium mb-1">Total Techniciens</p>
              <p className="text-3xl font-bold text-white">{data.techniciens.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">🔧</div>
          </div>
        </div>

        <div 
          className={`bg-[#1e1e1e] rounded-xl p-5 border cursor-pointer transition-all ${activeTab === 'equipes' ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)] scale-[1.02]' : 'border-gray-700 hover:border-gray-500 opacity-70 hover:opacity-100'}`} 
          onClick={() => setActiveTab('equipes')}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 font-medium mb-1">Total Équipes</p>
              <p className="text-3xl font-bold text-white">{data.equipes.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">👥</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => { checkHealth(); fetchAllData(); }} className="px-3 py-1 bg-red-500/20 rounded hover:bg-red-500/30">Réessayer</button>
        </div>
      )}

      {/* Grille d'affichage */}
      {loading && currentDataList.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-[#1e1e1e] rounded-xl border border-gray-700 animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentDataList.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 bg-[#1e1e1e] rounded-xl border border-gray-700">
              Aucune donnée trouvée pour la catégorie {activeTab}
            </div>
          ) : (
            currentDataList.map((item) => (
              <div key={item.id} className="bg-[#1e1e1e] rounded-xl p-5 border border-gray-700 hover:border-gray-500 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl ${
                        activeTab === 'equipes' ? 'bg-purple-600' : activeTab === 'techniciens' ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        {(item.nom || item.prenom || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-lg leading-tight">
                          {activeTab === 'equipes' ? item.nom : `${item.nom || ''} ${item.prenom || ''}`}
                        </h4>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">ID: #{item.id}</p>
                      </div>
                    </div>
                    {/* Badge de Statut */}
                    {(item.hasOwnProperty('actif') || item.hasOwnProperty('disponible')) && (
                      <span className={`px-2 py-1 text-xs font-bold rounded border ${
                        item.actif || item.disponible ? 'bg-green-500/10 text-green-400 border-green-500/50' : 'bg-red-500/10 text-red-400 border-red-500/50'
                      }`}>
                        {item.actif ? 'ACTIF' : item.disponible ? 'DISPO' : 'INDISPO'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm bg-[#151515] rounded-lg p-3 mb-2 border border-gray-800">
                    {item.email && (
                      <div className="flex justify-between items-center"><span className="text-gray-500">Email</span><span className="text-gray-300 truncate ml-2" title={item.email}>{item.email}</span></div>
                    )}
                    {item.telephone && (
                      <div className="flex justify-between items-center"><span className="text-gray-500">Tél</span><span className="text-gray-300">{item.telephone}</span></div>
                    )}
                    {item.role && (
                      <div className="flex justify-between items-center"><span className="text-gray-500">Rôle</span><span className="text-blue-400 font-medium text-xs px-2 py-0.5 bg-blue-500/10 rounded">{item.role}</span></div>
                    )}
                    {item.specialite && (
                      <div className="flex justify-between items-center"><span className="text-gray-500">Spécialité</span><span className="text-gray-300">{item.specialite}</span></div>
                    )}
                    {item.equipe && (
                      <div className="flex justify-between items-center"><span className="text-gray-500">Équipe</span><span className="text-purple-400 font-medium text-xs px-2 py-0.5 bg-purple-500/10 rounded">{item.equipe.nom || `ID: ${item.equipe.id}`}</span></div>
                    )}
                  </div>
                  
                  {item.description && (
                    <div className="text-gray-400 text-xs italic px-1 line-clamp-2" title={item.description}>{item.description}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showAddModal && (
        <AddModal
          type={activeTab}
          equipesList={data.equipes}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchAllData();
            showToast('Ajouté avec succès !');
          }}
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// MODAL D'AJOUT (POST EXACTEMENT COMME POSTMAN)
// -------------------------------------------------------------
const AddModal = ({ type, equipesList, onClose, onSuccess }) => {
  const { urls } = useConfig();
  const [submitting, setSubmitting] = useState(false);
  
  // State adapté aux Payloads Postman
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'EMPLOYE',
    specialite: '',
    description: '',
    equipeId: equipesList.length > 0 ? equipesList[0].id : '',
    actif: true,
    disponible: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let payload = {};
    let endpoint = '';

    // 1. API: POST /utilisateurs
    if (type === 'utilisateurs') {
      endpoint = '/utilisateurs';
      payload = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        role: formData.role,
        actif: formData.actif
      };
    } 
    // 2. API: POST /techniciens
    else if (type === 'techniciens') {
      endpoint = '/techniciens';
      payload = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        specialite: formData.specialite,
        disponible: formData.disponible,
        equipe: { id: parseInt(formData.equipeId) }
      };
    } 
    // 3. API: POST /equipes
    else if (type === 'equipes') {
      endpoint = '/equipes';
      payload = {
        nom: formData.nom,
        specialite: formData.specialite,
        description: formData.description
      };
    }

    try {
      const response = await fetch(`${urls.utilisateurs}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.text();
        alert(`Erreur API: ${errorData || 'Impossible de créer la ressource'}`);
      }
    } catch (err) {
      alert('Erreur de connexion au service Utilisateurs');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm px-4">
      <div className="bg-[#1e1e1e] rounded-2xl p-6 w-full max-w-md shadow-2xl relative border border-gray-700">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-1 bg-gray-800 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h3 className="text-xl font-bold text-white mb-6">
          Ajouter un{type === 'equipes' ? 'e Équipe' : type === 'techniciens' ? ' Technicien' : ' Utilisateur'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase tracking-wider">Nom</label>
              <input type="text" required placeholder="Ex: Alami" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} className="w-full px-4 py-2.5 bg-[#151515] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
            </div>
            {type !== 'equipes' && (
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase tracking-wider">Prénom</label>
                <input type="text" required placeholder="Ex: Sara" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} className="w-full px-4 py-2.5 bg-[#151515] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
              </div>
            )}
          </div>

          {type !== 'equipes' && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase tracking-wider">Email</label>
                <input type="email" required placeholder="sara.alami@gmail.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-[#151515] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase tracking-wider">Téléphone</label>
                <input type="text" placeholder="0698765432" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} className="w-full px-4 py-2.5 bg-[#151515] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
              </div>
            </>
          )}

          {type === 'utilisateurs' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase tracking-wider">Rôle</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2.5 bg-[#151515] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none appearance-none">
                <option value="EMPLOYE">EMPLOYE</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          )}

          {(type === 'techniciens' || type === 'equipes') && (
            <div>
              <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase tracking-wider">Spécialité</label>
              <input type="text" required placeholder="Ex: Réseau" value={formData.specialite} onChange={(e) => setFormData({ ...formData, specialite: e.target.value })} className="w-full px-4 py-2.5 bg-[#151515] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
            </div>
          )}

          {type === 'equipes' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase tracking-wider">Description</label>
              <textarea rows="2" required placeholder="Gestion des incidents réseau..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 bg-[#151515] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none" />
            </div>
          )}

          {type === 'techniciens' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase tracking-wider">Assigner à une Équipe</label>
              <select required value={formData.equipeId} onChange={(e) => setFormData({ ...formData, equipeId: e.target.value })} className="w-full px-4 py-2.5 bg-[#151515] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none appearance-none">
                <option value="">Sélectionner l'équipe...</option>
                {equipesList.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.nom}</option>
                ))}
              </select>
            </div>
          )}

          {/* Toggle Actif/Disponible */}
          {type !== 'equipes' && (
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="statusToggle"
                checked={type === 'utilisateurs' ? formData.actif : formData.disponible} 
                onChange={(e) => type === 'utilisateurs' ? setFormData({ ...formData, actif: e.target.checked }) : setFormData({ ...formData, disponible: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" 
              />
              <label htmlFor="statusToggle" className="text-sm text-gray-300 cursor-pointer">
                {type === 'utilisateurs' ? "Compte Actif" : "Technicien Disponible"}
              </label>
            </div>
          )}

          <div className="pt-4 mt-4 border-t border-gray-800">
            <button
              type="submit"
              disabled={submitting || (type === 'techniciens' && !formData.equipeId)}
              className="w-full py-3 bg-[#1877F2] hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors flex justify-center items-center disabled:opacity-50"
            >
              {submitting ? 'Traitement en cours...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UtilisateursView;