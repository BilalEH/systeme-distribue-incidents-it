import React, { createContext, useContext, useState, useEffect } from 'react';

//change localhost to actual IP address of the service
const DEFAULT_SERVICES = [
  { id: 'equipements', name: 'Equipements', url: 'http://localhost:8084' }, 
  { id: 'notifications', name: 'Notifications', url: 'http://localhost:8085' },
  { id: 'affectation', name: 'Affectation', url: 'http://localhost:8082' },
  { id: 'incidents', name: 'Incidents', url: 'http://localhost:8081' },
  { id: 'utilisateurs', name: 'Utilisateurs', url: 'http://localhost:8083' },
];

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('microservices-config');
    return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
  });

  useEffect(() => {
    localStorage.setItem('microservices-config', JSON.stringify(services));
  }, [services]);

  const updateServiceUrl = (serviceId, newUrl) => {
    setServices(prev =>
      prev.map(s => (s.id === serviceId ? { ...s, url: newUrl } : s))
    );
  };

  const updateAllServices = (newServices) => {
    setServices(newServices);
  };

  const getServiceUrl = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.url : '';
  };

  const urls = {
    equipements: services.find(s => s.id === 'equipements')?.url || '',
    notifications: services.find(s => s.id === 'notifications')?.url || '',
    affectation: services.find(s => s.id === 'affectation')?.url || '',
    incidents: services.find(s => s.id === 'incidents')?.url || '',
    utilisateurs: services.find(s => s.id === 'utilisateurs')?.url || '',
  };

  return (
    <ConfigContext.Provider
      value={{
        services,
        urls,
        updateServiceUrl,
        updateAllServices,
        getServiceUrl,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
