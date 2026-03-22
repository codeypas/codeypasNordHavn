import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { useShipmentStore } from '../store/shipmentStore';
import { useNotificationStore } from '../store/notificationStore';
import Layout from '../components/Layout';
import ShipmentForm from '../components/ShipmentForm';
import { generateAllShipmentsPDF } from '../utils/pdfGenerator';

export default function ManageShipments() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const shipments = useShipmentStore((state) => state.shipments);
  const fetchShipments = useShipmentStore((state) => state.fetchShipments);
  const addShipment = useShipmentStore((state) => state.addShipment);
  const updateShipment = useShipmentStore((state) => state.updateShipment);
  const deleteShipment = useShipmentStore((state) => state.deleteShipment);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        addNotification('Shipment deleted successfully!', 'success');
      } catch (error) {
        addNotification('Error deleting shipment: ' + error, 'error');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingShipment) {
        await updateShipment(token, editingShipment._id, formData);
        addNotification('Shipment updated successfully!', 'success');
      } else {
        await addShipment(token, formData);
        addNotification('Shipment added successfully!', 'success');
      }

      setShowForm(false);
      setEditingShipment(null);
    } catch (error) {
      addNotification(`Error saving shipment: ${error}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (shipment) => {
    setEditingShipment(shipment);
    setShowForm(true);
  };

  const downloadPDF = () => {
    try {
      if (shipments.length === 0) {
        addNotification('No shipments to download', 'error');
        return;
      }

      generateAllShipmentsPDF(shipments);
      addNotification('PDF downloaded successfully', 'success');
    } catch (error) {
      console.error('PDF Error:', error);
      addNotification('Error generating PDF', 'error');
    }
  };

  const getAnomalyColor = (severity) => {
    if (severity === 'high') return 'bg-red-100 text-red-800';
    if (severity === 'medium') return 'bg-orange-100 text-orange-800';
    return 'bg-slate-100 text-slate-700';
  };

  if (loading || !user || user.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900">Manage Shipments</h1>
          <div className="space-x-2">
            <button
              onClick={downloadPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Download Report PDF
            </button>
            {!showForm && (
              <button
                onClick={() => { setEditingShipment(null); setShowForm(true); }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Add New Shipment
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow">
            <ShipmentForm 
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingShipment(null); }}
              initialData={editingShipment}
              isLoading={isSubmitting}
            />
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Pattern</th>
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
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {shipment.isUnusual ? (
                      <div className="space-y-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getAnomalyColor(shipment.anomalySeverity)}`}>
                          Unusual ({shipment.anomalySeverity || 'low'})
                        </span>
                        <p className="text-xs text-slate-500 max-w-xs">
                          {shipment.anomalies?.[0]?.reason || 'Pattern flagged by anomaly rules.'}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Normal</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(shipment)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
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
