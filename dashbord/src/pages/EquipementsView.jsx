import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';

const EquipementsView = () => {
  const { urls } = useConfig();
  const [equipements, setEquipements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterEtat, setFilterEtat] = useState('all');
  const [searchCategorie, setSearchCategorie] = useState('');
  
  // Nouveaux states l'animation w notification (Toast)
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchEquipements();
  }, [urls]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEquipements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${urls.equipements}/equipements`);
      if (response.ok) {
        const data = await response.json();
        setEquipements(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Erreur API');
      }
    } catch (err) {
      setError('Impossible de se connecter au service Equipements.');
    } finally {
      setLoading(false);
    }
  };

  const fetchByCategorie = async (e) => {
    e.preventDefault();
    if (!searchCategorie.trim()) return fetchEquipements();
    setLoading(true);
    try {
      const response = await fetch(`${urls.equipements}/equipements/categorie/${searchCategorie}`);
      if (response.ok) {
        const data = await response.json();
        setEquipements(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      showToast('Erreur lors de la recherche', 'error');
    } finally {
      setLoading(false);
    }
  };


  const updateEtat = async (id, nouvelEtat) => {
    setUpdatingId(id);
    try {
      const response = await fetch(`${urls.equipements}/equipements/${id}/etat`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etat: nouvelEtat })
      });
      
      if (response.ok) {
        await fetchEquipements(); 
        
        showToast('État mis à jour avec succès !'); 
      } else {
        showToast('Erreur lors de la modification', 'error');
      }
    } catch (err) {
      showToast('Erreur de connexion', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (etat) => {
    const colors = {
      ACTIF: 'bg-green-500/20 text-green-400 border-green-500',
      EN_MAINTENANCE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
      EN_PANNE: 'bg-red-500/20 text-red-400 border-red-500',
    };
    return colors[etat?.toUpperCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500';
  };

  const filteredEquipements = equipements.filter(eq => {
    if (filterEtat === 'all') return true;
    return eq.etat?.toUpperCase() === filterEtat.toUpperCase();
  });

  const stats = {
    total: equipements.length,
    actif: equipements.filter(e => e.etat === 'ACTIF').length,
    maintenance: equipements.filter(e => e.etat === 'EN_MAINTENANCE').length,
    panne: equipements.filter(e => e.etat === 'EN_PANNE').length,
  };

  const uniqueCategories = [...new Set(equipements.map(eq => eq.categorie))].filter(Boolean);
  const defaultCategories = ['Ordinateur', 'Serveur', 'Routeur', 'Imprimante', 'Switch'];
  const allCategories = [...new Set([...defaultCategories, ...uniqueCategories])];

  return (
    <div className="p-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 transition-all transform animate-fade-in-down ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Équipements IT</h2>
          <p className="text-gray-400 mt-1">Gérer le matériel et les ressources IT</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all flex items-center gap-2"
        >
          + Ajouter Équipement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total */}
        <div className="bg-[#1e1e1e] rounded-xl p-5 border border-gray-700 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full"></div>
          <p className="text-sm text-gray-400 font-medium mb-1">Total Équipements</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        
        {/* Actifs */}
        <div className="bg-[#1e1e1e] rounded-xl p-5 border border-green-900/50 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full"></div>
          <p className="text-sm text-green-400 font-medium mb-1">Actifs</p>
          <p className="text-3xl font-bold text-green-400">{stats.actif}</p>
        </div>

        {/* En Maintenance */}
        <div className="bg-[#1e1e1e] rounded-xl p-5 border border-yellow-900/50 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-500/10 rounded-full"></div>
          <p className="text-sm text-yellow-400 font-medium mb-1">En Maintenance</p>
          <p className="text-3xl font-bold text-yellow-400">{stats.maintenance}</p>
        </div>

        {/* En Panne */}
        <div className="bg-[#1e1e1e] rounded-xl p-5 border border-red-900/50 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full"></div>
          <p className="text-sm text-red-400 font-medium mb-1">En Panne</p>
          <p className="text-3xl font-bold text-red-400">{stats.panne}</p>
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {['all', 'ACTIF', 'EN_MAINTENANCE', 'EN_PANNE'].map(status => (
              <button
                key={status}
                onClick={() => setFilterEtat(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterEtat === status ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {status === 'all' ? 'Tous' : status}
              </button>
            ))}
          </div>
          
          <form onSubmit={fetchByCategorie} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Rechercher par catégorie (ex: Serveur)"
              value={searchCategorie}
              onChange={(e) => setSearchCategorie(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 flex-1"
            />
            <button type="submit" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
              Rechercher API
            </button>
            <button type="button" onClick={() => { setSearchCategorie(''); fetchEquipements(); }} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-400 rounded-lg text-sm">
              ✕
            </button>
          </form>
        </div>

        {/* Grille */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {loading && equipements.length === 0 ? (
             <div className="col-span-full py-12 text-center text-white animate-pulse">Chargement en cours...</div>
          ) : filteredEquipements.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">Aucun équipement trouvé</div>
          ) : (
            filteredEquipements.map((eq) => (
              <div key={eq.id} className="bg-gray-900 rounded-xl p-5 border border-gray-700 hover:border-gray-500 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-white text-lg truncate max-w-[180px]" title={eq.nom}>{eq.nom}</h4>
                      <p className="text-xs text-gray-500 font-mono mt-1">ID: #{eq.id}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${getStatusColor(eq.etat)}`}>
                      {eq.etat}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm mb-5">
                    <div className="flex justify-between items-center bg-gray-800/50 rounded p-2">
                      <span className="text-gray-400">Catégorie</span>
                      <span className="text-gray-200 font-medium">{eq.categorie}</span>
                    </div>
                    <div className="p-2 text-gray-400 text-sm line-clamp-2" title={eq.description}>
                      {eq.description || 'Aucune description technique'}
                    </div>
                  </div>
                </div>
                
                {updatingId === eq.id ? (
                  <div className="w-full px-3 py-2.5 bg-blue-500/20 border border-blue-500 rounded-lg text-sm text-center text-blue-400 font-medium animate-pulse">
                    Mise à jour en cours...
                  </div>
                ) : (
                  <select
                    value={eq.etat}
                    onChange={(e) => updateEtat(eq.id, e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors hover:bg-gray-700"
                  >
                    <option value="ACTIF">Actif</option>
                    <option value="EN_MAINTENANCE">En Maintenance</option>
                    <option value="EN_PANNE">En Panne</option>
                  </select>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <AddEquipmentModal
          availableCategories={allCategories}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchEquipements();
            showToast('Équipement ajouté avec succès !');
          }}
        />
      )}
    </div>
  );
};


const AddEquipmentModal = ({ onClose, onSuccess, availableCategories }) => {
  const { urls } = useConfig();
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    categorie: availableCategories[0] || 'Ordinateur',
    etat: 'ACTIF',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    

    const finalData = { 
        ...formData, 
        categorie: isAddingNewCat && newCatInput.trim() ? newCatInput.trim() : formData.categorie 
    };

    try {
      const response = await fetch(`${urls.equipements}/equipements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });
      if (response.ok) {
        onSuccess();
      } else {
        alert('Erreur lors de l\'ajout');
      }
    } catch (err) {
      alert('Erreur API');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm px-4">
      <div className="bg-[#1e1e1e] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
          ✕
        </button>
        
        <h3 className="text-xl font-bold text-white mb-6">Ajouter un Équipement</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom */}
          <input
            type="text"
            required
            placeholder="Nom (ex: Routeur Cisco)"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            className="w-full px-4 py-3 bg-[#1e1e1e] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none placeholder-gray-400"
          />
          
          {/* Catégorie (Select + Bouton Plus) */}
          <div className="flex gap-2">
            {isAddingNewCat ? (
              <input
                type="text"
                required
                autoFocus
                placeholder="Nouvelle catégorie..."
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                className="flex-1 px-4 py-3 bg-[#1e1e1e] border border-blue-500 rounded-lg text-white focus:outline-none placeholder-gray-400"
              />
            ) : (
              <select
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="flex-1 px-4 py-3 bg-[#1e1e1e] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
            
            <button 
              type="button" 
              onClick={() => setIsAddingNewCat(!isAddingNewCat)}
              className={`px-4 py-2 border rounded-lg transition-colors flex items-center justify-center ${isAddingNewCat ? 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30' : 'bg-[#2a2d3e] border-gray-600 text-gray-300 hover:bg-gray-700'}`}
              title={isAddingNewCat ? "Annuler" : "Ajouter une nouvelle catégorie"}
            >
              {isAddingNewCat ? '✕' : '+'}
            </button>
          </div>

          {/* Description Technique */}
          <textarea
            required
            rows="3"
            placeholder="Détails techniques..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-[#1e1e1e] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none placeholder-gray-400 resize-none"
          />

          {/* État */}
          <select
            value={formData.etat}
            onChange={(e) => setFormData({ ...formData, etat: e.target.value })}
            className="w-full px-4 py-3 bg-[#1e1e1e] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="ACTIF">Actif</option>
            <option value="EN_MAINTENANCE">En Maintenance</option>
            <option value="EN_PANNE">En Panne</option>
          </select>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={submitting} 
              className="w-full py-3 bg-[#1877F2] hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors flex justify-center items-center"
            >
              {submitting ? 'Création en cours...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipementsView;