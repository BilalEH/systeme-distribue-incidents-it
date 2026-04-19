import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';

const LogsTracking = () => {
  const { urls } = useConfig();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [urls]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${urls.notifications}/notifications/historique`);
      if (response.ok) {
        const data = await response.json();
        setLogs(Array.isArray(data) ? data.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)) : []);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (err) {
      setError('Unable to connect to Notifications service. Please check if the service is running.');
      setLogs(generateMockLogs());
    } finally {
      setLoading(false);
    }
  };

  const generateMockLogs = () => {
    return [
      { id: 1, type: 'INCIDENT_CREATED', message: 'New incident #1234 created: Server downtime', timestamp: new Date(Date.now() - 300000).toISOString(), severity: 'HIGH' },
      { id: 2, type: 'STATUS_CHANGED', message: 'Equipment #12 status changed to Maintenance', timestamp: new Date(Date.now() - 600000).toISOString(), severity: 'INFO' },
      { id: 3, type: 'ASSIGNMENT', message: 'Incident #1233 assigned to John Doe', timestamp: new Date(Date.now() - 900000).toISOString(), severity: 'INFO' },
      { id: 4, type: 'INCIDENT_RESOLVED', message: 'Incident #1232 marked as resolved', timestamp: new Date(Date.now() - 1200000).toISOString(), severity: 'SUCCESS' },
      { id: 5, type: 'ALERT', message: 'Critical: Database connection failure detected', timestamp: new Date(Date.now() - 1800000).toISOString(), severity: 'CRITICAL' },
      { id: 6, type: 'USER_CREATED', message: 'New user Ahmed added to the system', timestamp: new Date(Date.now() - 2400000).toISOString(), severity: 'INFO' },
      { id: 7, type: 'EQUIPMENT_ADDED', message: 'New equipment Dell PowerEdge added', timestamp: new Date(Date.now() - 3000000).toISOString(), severity: 'INFO' },
      { id: 8, type: 'STATUS_CHANGED', message: 'Incident priority upgraded to CRITICAL', timestamp: new Date(Date.now() - 3600000).toISOString(), severity: 'HIGH' },
    ];
  };

  const getTypeIcon = (type) => {
    const icons = {
      INCIDENT_CREATED: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      INCIDENT_RESOLVED: 'M5 13l4 4L19 7',
      STATUS_CHANGED: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      ASSIGNMENT: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
      ALERT: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      USER_CREATED: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      EQUIPMENT_ADDED: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    };
    return icons[type] || icons.STATUS_CHANGED;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      CRITICAL: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400', dot: 'bg-red-500' },
      HIGH: { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-400', dot: 'bg-orange-500' },
      INFO: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', dot: 'bg-blue-500' },
      SUCCESS: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400', dot: 'bg-green-500' },
    };
    return colors[severity] || colors.INFO;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.severity?.toUpperCase() === filter.toUpperCase();
  });

  const severityCounts = {
    CRITICAL: logs.filter(l => l.severity === 'CRITICAL').length,
    HIGH: logs.filter(l => l.severity === 'HIGH').length,
    INFO: logs.filter(l => l.severity === 'INFO').length,
    SUCCESS: logs.filter(l => l.severity === 'SUCCESS').length,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Logs & Activity</h2>
          <p className="text-gray-400 mt-1">System events and notifications timeline</p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400">
          Showing mock data - Notifications service is offline
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`bg-gray-800 rounded-xl p-4 border transition-all ${filter === 'all' ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
        >
          <p className="text-2xl font-bold text-white">{logs.length}</p>
          <p className="text-sm text-gray-400">Total Logs</p>
        </button>
        <button
          onClick={() => setFilter('CRITICAL')}
          className={`bg-red-500/10 rounded-xl p-4 border transition-all ${filter === 'CRITICAL' ? 'border-red-500 ring-1 ring-red-500' : 'border-red-700 hover:border-red-600'}`}
        >
          <p className="text-2xl font-bold text-red-400">{severityCounts.CRITICAL}</p>
          <p className="text-sm text-red-400/70">Critical</p>
        </button>
        <button
          onClick={() => setFilter('HIGH')}
          className={`bg-orange-500/10 rounded-xl p-4 border transition-all ${filter === 'HIGH' ? 'border-orange-500 ring-1 ring-orange-500' : 'border-orange-700 hover:border-orange-600'}`}
        >
          <p className="text-2xl font-bold text-orange-400">{severityCounts.HIGH}</p>
          <p className="text-sm text-orange-400/70">High</p>
        </button>
        <button
          onClick={() => setFilter('INFO')}
          className={`bg-blue-500/10 rounded-xl p-4 border transition-all ${filter === 'INFO' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-blue-700 hover:border-blue-600'}`}
        >
          <p className="text-2xl font-bold text-blue-400">{severityCounts.INFO}</p>
          <p className="text-sm text-blue-400/70">Info</p>
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Activity Timeline</h3>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-700"></div>
            <div className="space-y-6">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No logs found for the selected filter
                </div>
              ) : (
                filteredLogs.map((log, index) => {
                  const colors = getSeverityColor(log.severity);
                  return (
                    <div key={log.id || index} className="relative flex gap-4">
                      <div className={`relative z-10 w-10 h-10 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center`}>
                        <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getTypeIcon(log.action)} />
                        </svg>
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-start justify-between mb-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors.bg} ${colors.text}`}>
                              {log.action?.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {log.dateAction ? formatTimestamp(log.dateAction) : formatTimestamp(log.timestamp)}
                            </span>
                          </div>
                          <p className="text-white mb-1">{log.details}</p>
                          <p className="text-sm text-gray-400">By: {log.acteurNom}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsTracking;
