import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useShipmentStore } from '../store/shipmentStore';

export default function ShipmentForm({ onSuccess, onCancel }) {
  const token = useAuthStore((state) => state.token);
  const addShipment = useShipmentStore((state) => state.addShipment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    shipmentId: '',
    origin: '',
    destination: '',
    status: 'In Transit',
    riskScore: 0,
    compliancePercentage: 100,
    departureDate: '',
    expectedArrival: '',
    cargoType: '',
    weight: '',
    value: '',
    currentLocation: '',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'weight' || name === 'value' || name === 'riskScore' || name === 'compliancePercentage' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await addShipment(token, formData);
      onSuccess();
      setFormData({
        shipmentId: '',
        origin: '',
        destination: '',
        status: 'In Transit',
        riskScore: 0,
        compliancePercentage: 100,
        departureDate: '',
        expectedArrival: '',
        cargoType: '',
        weight: '',
        value: '',
        currentLocation: '',
        notes: '',
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="shipmentId"
          placeholder="Shipment ID (e.g., SHP-007)"
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
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Shipment'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-slate-300 hover:bg-slate-400 text-slate-900 font-bold py-2 px-4 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
