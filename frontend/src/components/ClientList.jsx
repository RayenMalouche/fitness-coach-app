// Client List Component for Coach
// Displays all clients with approval and credit management

import { useState, useEffect } from 'react';
import { clientAPI } from '../services/api';

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [creditAmount, setCreditAmount] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await clientAPI.getAll();
      setClients(response.data.clients);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (clientId) => {
    try {
      await clientAPI.approve(clientId);
      await loadClients();
    } catch (error) {
      alert('Failed to approve client');
    }
  };

  const handleReject = async (clientId) => {
    if (!confirm('Are you sure you want to reject this client? This will delete their account.')) {
      return;
    }
    try {
      await clientAPI.reject(clientId);
      await loadClients();
    } catch (error) {
      alert('Failed to reject client');
    }
  };

  const handleUpdateCredits = async (e) => {
    e.preventDefault();
    if (!selectedClient || !creditAmount) return;

    try {
      await clientAPI.updateCredits(selectedClient.id, parseInt(creditAmount));
      setSelectedClient(null);
      setCreditAmount('');
      await loadClients();
    } catch (error) {
      alert('Failed to update credits');
    }
  };

  const pendingClients = clients.filter(c => !c.approved);
  const approvedClients = clients.filter(c => c.approved);

  if (loading) {
    return <div className="text-center py-8">Loading clients...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Pending Clients */}
      {pendingClients.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Approval</h2>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingClients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleApprove(client.id)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(client.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approved Clients */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Approved Clients</h2>
        {approvedClients.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No approved clients yet</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {approvedClients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {client.sessionCredits
                          ? `${client.sessionCredits.totalCredits - client.sessionCredits.usedCredits} / ${client.sessionCredits.totalCredits}`
                          : '0 / 0'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setCreditAmount(client.sessionCredits?.totalCredits?.toString() || '0');
                        }}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Set Credits
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Credit Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Set Credits for {selectedClient.name}
            </h3>
            <form onSubmit={handleUpdateCredits}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Session Credits
                </label>
                <input
                  type="number"
                  min="0"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter number of credits"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Update Credits
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClient(null);
                    setCreditAmount('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}