import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import Layout from '../../components/Layout';
import { generateSingleShipmentPDF } from '../../utils/pdfGenerator';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function ShipmentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        router.push('/login');
      }
    };
    verifyAuth();
  }, [router]);

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
      addNotification('Error fetching shipment: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    try {
      if (!shipment) {
        addNotification('No shipment data to download', 'error');
        return;
      }
      generateSingleShipmentPDF(shipment);
      addNotification('PDF downloaded successfully!', 'success');
    } catch (error) {
      addNotification('Error generating PDF: ' + error.message, 'error');
    }
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">Loading...</div>
      </Layout>
    );
  }

  if (!shipment) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-slate-600">Shipment not found</p>
        </div>
      </Layout>
    );
  }

  const delayPrediction = shipment.delayPrediction || {
    label: 'Unknown',
    score: 50,
    confidence: 'Low',
    summary: 'Prediction unavailable.',
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Shipment: {shipment.shipmentId}</h1>
            <p className="text-slate-600 mt-1">View shipment details and tracking information</p>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Download PDF Report
          </button>
        </div>

        {/* Shipment Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Route Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-slate-600 text-sm">Origin</p>
                <p className="text-slate-900 font-semibold">{shipment.origin}</p>
              </div>
              <div>
                <p className="text-slate-600 text-sm">Destination</p>
                <p className="text-slate-900 font-semibold">{shipment.destination}</p>
              </div>
              <div>
                <p className="text-slate-600 text-sm">Current Location</p>
                <p className="text-slate-900 font-semibold">{shipment.currentLocation}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Status & Dates</h2>
            <div className="space-y-3">
              <div>
                <p className="text-slate-600 text-sm">Status</p>
                <span className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800">
                  {shipment.status}
                </span>
              </div>
              <div>
                <p className="text-slate-600 text-sm">ETA Prediction</p>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    delayPrediction.label === 'Likely Delayed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {delayPrediction.label}
                </span>
              </div>
              <div>
                <p className="text-slate-600 text-sm">Departure Date</p>
                <p className="text-slate-900 font-semibold">
                  {shipment.departureDate ? new Date(shipment.departureDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-slate-600 text-sm">Expected Arrival</p>
                <p className="text-slate-900 font-semibold">
                  {shipment.expectedArrival ? new Date(shipment.expectedArrival).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk & Compliance */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Risk Assessment</h2>
            <div className="space-y-3">
              <div>
                <p className="text-slate-600 text-sm">Risk Score</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-3xl font-bold text-slate-900">{shipment.riskScore}</span>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      shipment.riskScore < 30
                        ? 'bg-green-100 text-green-800'
                        : shipment.riskScore < 60
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {shipment.riskScore < 30 ? 'Low' : shipment.riskScore < 60 ? 'Medium' : 'High'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Compliance</h2>
            <div className="space-y-3">
              <div>
                <p className="text-slate-600 text-sm">Compliance Percentage</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-3xl font-bold text-slate-900">{shipment.compliancePercentage}%</span>
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        shipment.compliancePercentage >= 80
                          ? 'bg-green-500'
                          : shipment.compliancePercentage >= 60
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${shipment.compliancePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Delay Prediction Model</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-slate-600 text-sm">Prediction</p>
              <p
                className={`font-semibold ${
                  delayPrediction.label === 'Likely Delayed'
                    ? 'text-red-600'
                    : 'text-emerald-600'
                }`}
              >
                {delayPrediction.label}
              </p>
            </div>
            <div>
              <p className="text-slate-600 text-sm">Delay Probability</p>
              <p className="text-slate-900 font-semibold">{delayPrediction.score}%</p>
            </div>
            <div>
              <p className="text-slate-600 text-sm">Confidence</p>
              <p className="text-slate-900 font-semibold">{delayPrediction.confidence}</p>
            </div>
          </div>
          <p className="text-slate-600 mt-4">{delayPrediction.summary}</p>
        </div>

        {/* Cargo Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Cargo Details</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-slate-600 text-sm">Cargo Type</p>
              <p className="text-slate-900 font-semibold">{shipment.cargoType}</p>
            </div>
            <div>
              <p className="text-slate-600 text-sm">Weight (kg)</p>
              <p className="text-slate-900 font-semibold">{shipment.weight}</p>
            </div>
            <div>
              <p className="text-slate-600 text-sm">Value</p>
              <p className="text-slate-900 font-semibold">${shipment.value}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {shipment.notes && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Notes</h2>
            <p className="text-slate-600">{shipment.notes}</p>
          </div>
        )}

        {/* Documents */}
        {shipment.documents && shipment.documents.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Documents</h2>
            <ul className="space-y-2">
              {shipment.documents.map((doc, index) => (
                <li key={index} className="text-slate-600">
                  • {doc}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}
