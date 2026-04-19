import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';

const Dashboard = () => {
  const { services } = useConfig();
  const [pingStatus, setPingStatus] = useState({});
  const [loading, setLoading] = useState({});
  const [lastPing, setLastPing] = useState({});

  const pingService = async (service) => {
    setLoading(prev => ({ ...prev, [service.id]: true }));
    setPingStatus(prev => ({ ...prev, [service.id]: 'checking' }));

    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(service.url, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors',
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      setPingStatus(prev => ({ ...prev, [service.id]: 'online' }));
      setLastPing(prev => ({ ...prev, [service.id]: latency }));
    } catch (error) {
      setPingStatus(prev => ({ ...prev, [service.id]: 'offline' }));
      setLastPing(prev => ({ ...prev, [service.id]: null }));
    } finally {
      setLoading(prev => ({ ...prev, [service.id]: false }));
    }
  };

  const pingAll = () => {
    services.forEach(service => pingService(service));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'checking':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'checking':
        return 'Checking...';
      default:
        return 'Not tested';
    }
  };

  const getServiceIcon = (id) => {
    const icons = {
      equipements: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      notifications: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      affectation: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
      incidents: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      utilisateurs: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    };
    return icons[id] || icons.incidents;
  };

  const onlineCount = Object.values(pingStatus).filter(s => s === 'online').length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Service Dashboard</h2>
          <p className="text-gray-400 mt-1">Monitor your microservices status</p>
        </div>
        <button
          onClick={pingAll}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg shadow-cyan-600/30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Ping All Services
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getServiceIcon(service.id)} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                  <p className="text-xs text-gray-500 uppercase">{service.id}</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(pingStatus[service.id])} ${pingStatus[service.id] === 'checking' ? 'animate-pulse' : ''}`} />
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">Endpoint URL</p>
              <p className="text-sm text-gray-300 font-mono bg-gray-900 p-2 rounded break-all">
                {service.url}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <p className={`font-medium ${pingStatus[service.id] === 'online' ? 'text-green-400' : pingStatus[service.id] === 'offline' ? 'text-red-400' : 'text-gray-400'}`}>
                  {getStatusText(pingStatus[service.id])}
                </p>
                {lastPing[service.id] !== undefined && lastPing[service.id] !== null && (
                  <p className="text-xs text-gray-500 mt-1">
                    Latency: {lastPing[service.id]}ms
                  </p>
                )}
              </div>
              <button
                onClick={() => pingService(service)}
                disabled={loading[service.id]}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  loading[service.id]
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {loading[service.id] ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Ping...
                  </span>
                ) : (
                  'Ping Service'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">System Status:</span>
            <span className={`font-medium ${onlineCount === services.length ? 'text-green-400' : onlineCount > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
              {onlineCount}/{services.length} Services Online
            </span>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-400">Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-400">Offline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-gray-400">Checking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
