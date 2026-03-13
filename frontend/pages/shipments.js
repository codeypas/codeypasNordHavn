import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { useShipmentStore } from '../store/shipmentStore';
import Layout from '../components/Layout';
import Link from 'next/link';

export default function Shipments() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const shipments = useShipmentStore((state) => state.shipments);
  const fetchShipments = useShipmentStore((state) => state.fetchShipments);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

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
    if (token) {
      fetchShipments(token);
    }
  }, [token]);

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const filtered = shipments.filter((s) => {
    const matchSearch = s.shipmentId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getRiskColor = (score) => {
    if (score < 30) return 'bg-green-100 text-green-800';
    if (score < 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getAnomalyColor = (severity) => {
    if (severity === 'high') return 'bg-red-100 text-red-800';
    if (severity === 'medium') return 'bg-orange-100 text-orange-800';
    return 'bg-slate-100 text-slate-700';
  };

  const getTopReason = (shipment) => {
    if (!shipment?.anomalies?.length) return '-';
    return shipment.anomalies[0].reason;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900">Shipments</h1>
          {user.role === 'admin' && (
            <Link href="/manage-shipments">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
                Add Shipment
              </button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow flex gap-4">
          <input
            type="text"
            placeholder="Search by Shipment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="In Transit">In Transit</option>
            <option value="At Port">At Port</option>
            <option value="Delayed">Delayed</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Shipment ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Route</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Risk</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Pattern</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Compliance</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((shipment) => (
                <tr key={shipment._id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">
                    <Link href={`/shipment/${shipment._id}`}>{shipment.shipmentId}</Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {shipment.origin} → {shipment.destination}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">{shipment.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(shipment.riskScore)}`}>
                      {shipment.riskScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {shipment.isUnusual ? (
                      <div className="space-y-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getAnomalyColor(shipment.anomalySeverity)}`}>
                          Unusual ({shipment.anomalySeverity || 'low'})
                        </span>
                        <p className="text-xs text-slate-500 max-w-xs">{getTopReason(shipment)}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Normal</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{shipment.compliancePercentage}%</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <Link href={`/shipment/${shipment._id}`}>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                    </Link>
                    {user.role === 'admin' && (
                      <>
                        <Link href={`/edit-shipment/${shipment._id}`}>
                          <button className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && <p className="text-center text-slate-600 py-8">No shipments found</p>}
      </div>
    </Layout>
  );
}
