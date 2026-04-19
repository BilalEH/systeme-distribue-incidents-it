import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';

const Overview = () => {
  const { services, urls } = useConfig();
  const [pingStatus, setPingStatus] = useState({});
  const [loading, setLoading] = useState({});
  const [stats, setStats] = useState({
    activeIncidents: 0,
    offlineGear: 0,
    totalEquipments: 0,
    totalUsers: 0,
    criticalAlerts: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [urls]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const [incidentsRes, equipementsRes, utilisateursRes] = await Promise.allSettled([
        fetch(`${urls.incidents}/api/incidents`).catch(() => null),
        fetch(`${urls.equipements}/api/equipements`).catch(() => null),
        fetch(`${urls.utilisateurs}/api/utilisateurs`).catch(() => null),
      ]);

      let activeIncidents = 0;
      let totalEquipments = 0;
      let offlineGear = 0;
      let totalUsers = 0;

      if (incidentsRes.status === 'fulfilled' && incidentsRes.value?.ok) {
        const data = await incidentsRes.value.json();
        activeIncidents = Array.isArray(data) ? data.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length : 0;
      }

      if (equipementsRes.status === 'fulfilled' && equipementsRes.value?.ok) {
        const data = await equipementsRes.value.json();
        totalEquipments = Array.isArray(data) ? data.length : 0;
        offlineGear = Array.isArray(data) ? data.filter(e => e.status === 'OFFLINE' || e.status === 'BROKEN').length : 0;
      }

      if (utilisateursRes.status === 'fulfilled' && utilisateursRes.value?.ok) {
        const data = await utilisateursRes.value.json();
        totalUsers = Array.isArray(data) ? data.length : 0;
      }

      setStats({
        activeIncidents,
        offlineGear,
        totalEquipments,
        totalUsers,
        criticalAlerts: activeIncidents > 5 ? Math.floor(activeIncidents / 3) : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const pingService = async (service) => {
    setLoading(prev => ({ ...prev, [service.id]: true }));
    setPingStatus(prev => ({ ...prev, [service.id]: 'checking' }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch(service.url, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors',
      });

      clearTimeout(timeoutId);
      setPingStatus(prev => ({ ...prev, [service.id]: 'online' }));
    } catch (error) {
      setPingStatus(prev => ({ ...prev, [service.id]: 'offline' }));
    } finally {
      setLoading(prev => ({ ...prev, [service.id]: false }));
    }
  };

  const pingAll = () => {
    services.forEach(service => pingService(service));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'checking': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'checking': return 'Checking...';
      default: return 'Not tested';
    }
  };

  const onlineCount = Object.values(pingStatus).filter(s => s === 'online').length;

  const statCards = [
    { label: 'Active Incidents', value: stats.activeIncidents, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Offline Gear', value: stats.offlineGear, icon: 'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Total Equipments', value: stats.totalEquipments, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Total Users', value: stats.totalUsers, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">System Overview</h2>
          <p className="text-gray-400 mt-1">Monitor your distributed system health</p>
        </div>
        <button
          onClick={pingAll}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Ping All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.bg} rounded-xl p-5 border border-gray-700`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                {loadingStats ? (
                  <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                )}
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <svg className={`w-6 h-6 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Service Health</h3>
          <span className={`text-sm ${onlineCount === services.length ? 'text-green-400' : onlineCount > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
            {onlineCount}/{services.length} Online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white text-sm">{service.name}</span>
                <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(pingStatus[service.id])} ${pingStatus[service.id] === 'checking' ? 'animate-pulse' : ''}`} />
              </div>
              <p className="text-xs text-gray-500 mb-3 truncate">{service.url}</p>
              <button
                onClick={() => pingService(service)}
                disabled={loading[service.id]}
                className={`w-full text-xs py-1.5 rounded transition-all ${
                  loading[service.id] ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {pingStatus[service.id] ? getStatusText(pingStatus[service.id]) : 'Ping'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {['System initialized', 'Configuration loaded', 'Monitoring active'].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span className="text-gray-300">{activity}</span>
                <span className="text-gray-500 ml-auto">{i + 1}m ago</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">System Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Version</span>
              <span className="text-white">v2.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Microservices</span>
              <span className="text-white">{services.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">API Format</span>
              <span className="text-white">REST</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Storage</span>
              <span className="text-white">localStorage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
