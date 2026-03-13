import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import { useShipmentStore } from '../../store/shipmentStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function EditShipment() {
  const router = useRouter();
  const { id } = router.query;

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const updateShipment = useShipmentStore((state) => state.updateShipment);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuth();
      const currentUser = useAuthStore.getState().user;

      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (currentUser?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    };

    verifyAuth();
  }, [checkAuth, router]);

  useEffect(() => {
    const fetchShipment = async () => {
      if (!id || !token) return;

      try {
        const response = await axios.get(`${API_URL}/api/shipments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const shipment = response.data;

        setFormData({
          shipmentId: shipment.shipmentId || '',
          origin: shipment.origin || '',
          destination: shipment.destination || '',
          status: shipment.status || 'In Transit',
          riskScore: shipment.riskScore ?? 0,
          compliancePercentage: shipment.compliancePercentage ?? 100,
          departureDate: shipment.departureDate ? new Date(shipment.departureDate).toISOString().slice(0, 10) : '',
          expectedArrival: shipment.expectedArrival ? new Date(shipment.expectedArrival).toISOString().slice(0, 10) : '',
          cargoType: shipment.cargoType || '',
          weight: shipment.weight ?? '',
          value: shipment.value ?? '',
          currentLocation: shipment.currentLocation || '',
          notes: shipment.notes || '',
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch shipment');
      }
    };

    fetchShipment();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['weight', 'value', 'riskScore', 'compliancePercentage'];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    setError('');
    setSaving(true);

    try {
      await updateShipment(token, id, formData);
      setSuccessMessage('Shipment updated successfully!');
      setTimeout(() => {
        router.push('/shipments');
      }, 700);
    } catch (err) {
      setError(err || 'Failed to update shipment');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || user.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!formData && !error) {
    return <div className="flex items-center justify-center min-h-screen">Loading shipment...</div>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 font-medium">
          Back
        </button>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900">Edit Shipment</h1>
        </div>

        {error && <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">{error}</div>}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800">{successMessage}</div>
        )}

        {formData && (
          <div className="bg-white p-6 rounded-lg shadow">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="shipmentId"
                  placeholder="Shipment ID"
                  value={formData.shipmentId}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="origin"
                  placeholder="Origin"
                  value={formData.origin}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="destination"
                  placeholder="Destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>In Transit</option>
                  <option>At Port</option>
                  <option>Delayed</option>
                  <option>Completed</option>
                </select>
                <input
                  type="number"
                  name="riskScore"
                  placeholder="Risk Score (0-100)"
                  min="0"
                  max="100"
                  value={formData.riskScore}
                  onChange={handleChange}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  name="compliancePercentage"
                  placeholder="Compliance %"
                  min="0"
                  max="100"
                  value={formData.compliancePercentage}
                  onChange={handleChange}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  name="expectedArrival"
                  value={formData.expectedArrival}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="cargoType"
                  placeholder="Cargo Type"
                  value={formData.cargoType}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  name="weight"
                  placeholder="Weight (kg)"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  name="value"
                  placeholder="Value ($)"
                  value={formData.value}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="currentLocation"
                  placeholder="Current Location"
                  value={formData.currentLocation}
                  onChange={handleChange}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <textarea
                name="notes"
                placeholder="Notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update Shipment'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/shipments')}
                  className="bg-slate-300 hover:bg-slate-400 text-slate-900 font-bold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
