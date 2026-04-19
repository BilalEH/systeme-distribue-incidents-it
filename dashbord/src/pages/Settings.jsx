import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';

const Settings = () => {
  const { services, updateAllServices } = useConfig();
  const [formData, setFormData] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const initial = {};
    services.forEach(s => {
      initial[s.id] = s.url;
    });
    setFormData(initial);
  }, [services]);

  const handleChange = (serviceId, value) => {
    setFormData(prev => ({
      ...prev,
      [serviceId]: value,
    }));
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    const invalidUrls = Object.entries(formData).filter(
      ([_, url]) => !validateUrl(url)
    );

    if (invalidUrls.length > 0) {
      setToastMessage('Please enter valid URLs for all services');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const updatedServices = services.map(s => ({
      ...s,
      url: formData[s.id],
    }));

    updateAllServices(updatedServices);

    setToastMessage('Settings saved successfully!');
    setToastType('success');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleReset = () => {
    const initial = {};
    services.forEach(s => {
      initial[s.id] = s.url;
    });
    setFormData(initial);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 mt-1">Configure your microservices endpoints</p>
      </div>

      {showToast && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          toastType === 'success' 
            ? 'bg-green-600/20 border border-green-500 text-green-400' 
            : 'bg-red-600/20 border border-red-500 text-red-400'
        }`}>
          {toastType === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-3xl">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            Microservices Configuration
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Enter the base URLs for each microservice. These will be stored in localStorage and used for API calls.
          </p>

          <div className="space-y-5">
            {services.map((service) => (
              <div key={service.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-gray-900 rounded-lg">
                <div className="md:w-40 flex-shrink-0">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {service.name}
                  </label>
                  <span className="text-xs text-gray-500 uppercase">{service.id}</span>
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    value={formData[service.id] || ''}
                    onChange={(e) => handleChange(service.id, e.target.value)}
                    placeholder={`http://ip:port`}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      formData[service.id] && !validateUrl(formData[service.id])
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-700 focus:ring-cyan-500 focus:border-transparent'
                    }`}
                  />
                  {formData[service.id] && !validateUrl(formData[service.id]) && (
                    <p className="mt-1 text-xs text-red-400">Please enter a valid URL</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg shadow-cyan-600/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Settings
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset to Current
          </button>
        </div>
      </form>

      <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-3xl">
        <h3 className="text-lg font-semibold text-white mb-3">About LocalStorage</h3>
        <p className="text-gray-400 text-sm">
          Your microservice URLs are stored in your browser's localStorage. This means:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-1">•</span>
            URLs persist across browser sessions
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-1">•</span>
            URLs are specific to this browser and device
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-1">•</span>
            You can clear localStorage to reset to default values
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
