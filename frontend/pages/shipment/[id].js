import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import { useShipmentStore } from '../../store/shipmentStore';
import Layout from '../../components/Layout';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function ShipmentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const token = useAuthStore((state) => state.token);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      setLoading(false);
    };
    verifyAuth();
  }, []);

  useEffect(() => {
    if (id && token) {
      fetchShipment();
    }
  }, [id, token]);

  const fetchShipment = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/shipments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShipment(response.data);
    } catch (error) {
      console.error('Error fetching shipment:', error);
    }
  };

  if (loading || !shipment) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const getRiskColor = (score) => {
    if (score < 30) return 'bg-green-100 text-green-800';
    if (score < 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 font-medium">
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{shipment.shipmentId}</h1>
              <p className="text-slate-600 mt-2">
                {shipment.origin} → {shipment.destination}
              </p>
            </div>
            <span className={`px-4 py-2 rounded font-medium ${getRiskColor(shipment.riskScore)}`}>
              Risk: {shipment.riskScore}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-slate-600 text-sm font-medium">Status</p>
              <p className="text-lg font-semibold text-slate-900">{shipment.status}</p>
            </div>
            <div>
              <p className="text-slate-600 text-sm font-medium">Compliance</p>
              <p className="text-lg font-semibold text-slate-900">{shipment.compliancePercentage}%</p>
            </div>
            <div>
              <p className="text-slate-600 text-sm font-medium">Cargo Type</p>
              <p className="text-lg font-semibold text-slate-900">{shipment.cargoType}</p>
            </div>
            <div>
              <p className="text-slate-600 text-sm font-medium">Weight</p>
              <p className="text-lg font-semibold text-slate-900">{shipment.weight} kg</p>
            </div>
            <div>
              <p className="text-slate-600 text-sm font-medium">Value</p>
              <p className="text-lg font-semibold text-slate-900">${shipment.value.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-600 text-sm font-medium">Current Location</p>
              <p className="text-lg font-semibold text-slate-900">{shipment.currentLocation}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Dates</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-slate-600 text-sm font-medium">Departure</p>
                <p className="text-slate-900">{new Date(shipment.departureDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Expected Arrival</p>
                <p className="text-slate-900">{new Date(shipment.expectedArrival).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {shipment.notes && (
            <div className="border-t border-slate-200 pt-6 mt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Notes</h2>
              <p className="text-slate-600">{shipment.notes}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
