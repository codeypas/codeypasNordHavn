import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { useShipmentStore } from '../store/shipmentStore';
import Layout from '../components/Layout';
import ShipmentForm from '../components/ShipmentForm';

export default function ManageShipments() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const shipments = useShipmentStore((state) => state.shipments);
  const fetchShipments = useShipmentStore((state) => state.fetchShipments);
  const deleteShipment = useShipmentStore((state) => state.deleteShipment);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (isAuthenticated && user?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setLoading(false);
    };
    verifyAuth();
  }, []);

  useEffect(() => {
    if (token) {
      fetchShipments(token);
    }
  }, [token]);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this shipment?')) {
      try {
        await deleteShipment(token, id);
        setSuccessMessage('Shipment deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        alert('Error deleting shipment: ' + error);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSuccessMessage('Shipment added successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (loading || !user || user.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900">Manage Shipments</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Add New Shipment
            </button>
          )}
        </div>

        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800">{successMessage}</div>
        )}

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow">
            <ShipmentForm onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Shipments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Shipment ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Route</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Risk Score</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr key={shipment._id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{shipment.shipmentId}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {shipment.origin} → {shipment.destination}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">{shipment.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{shipment.riskScore}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleDelete(shipment._id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {shipments.length === 0 && <p className="text-center text-slate-600 py-8">No shipments yet</p>}
      </div>
    </Layout>
  );
}
