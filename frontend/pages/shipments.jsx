import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useAuthStore } from '../store/authStore';
import { useShipmentStore } from '../store/shipmentStore';
import { useNotificationStore } from '../store/notificationStore';

import Layout from '../components/Layout';
import { useShipmentNotifications } from '../hooks/useShipmentNotifications';
import { generateAllShipmentsPDF } from '../utils/pdfGenerator';

export default function ShipmentsPage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const shipments = useShipmentStore((state) => state.shipments);
  const fetchShipments = useShipmentStore((state) => state.fetchShipments);

  const addNotification = useNotificationStore((state) => state.addNotification);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useShipmentNotifications(shipments, Boolean(token && user));

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
  }, [checkAuth, router]);

  useEffect(() => {
    if (token) {
      fetchShipments(token);
    }
  }, [token, fetchShipments]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      fetchShipments(token);
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [token, fetchShipments]);

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.shipmentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destination?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filterStatus || shipment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const paginatedShipments = filteredShipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);

  const handleDownloadPDF = () => {
    try {
      generateAllShipmentsPDF(shipments);
      addNotification('PDF downloaded successfully!', 'success');
    } catch (error) {
      addNotification('Error generating PDF: ' + error.message, 'error');
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900">Shipments</h1>

          <button
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Download Report PDF
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="grid grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Search by ID, Origin, or Destination..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="In Transit">In Transit</option>
              <option value="At Port">At Port</option>
              <option value="Delayed">Delayed</option>
              <option value="Completed">Completed</option>
            </select>

          </div>

          <p className="text-sm text-slate-600">
            Showing {paginatedShipments.length} of {filteredShipments.length} shipments
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Shipment ID
                </th>

                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Route
                </th>

                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>

                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Risk
                </th>

                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Compliance
                </th>

                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  ETA Prediction
                </th>

                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedShipments.map((shipment) => (

                <tr
                  key={shipment._id}
                  className="border-b border-slate-200 hover:bg-slate-50"
                >

                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {shipment.shipmentId}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {shipment.origin} → {shipment.destination}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {shipment.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        shipment.riskScore < 30
                          ? 'bg-green-100 text-green-800'
                          : shipment.riskScore < 60
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {shipment.riskScore}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {shipment.compliancePercentage}%
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        shipment.delayPrediction?.label === 'Likely Delayed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {shipment.delayPrediction?.label || 'Unknown'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm">

                    {/* FIXED LINK (Next.js 14 compatible) */}
                    <Link
                      href={`/shipment/${shipment._id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Details
                    </Link>

                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>

        {/* Pagination */}
        {totalPages > 1 && (

          <div className="flex justify-center gap-2">

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (

              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                }`}
              >
                {page}
              </button>

            ))}

          </div>

        )}

        {filteredShipments.length === 0 && (
          <p className="text-center text-slate-600 py-8">
            No shipments found matching your criteria
          </p>
        )}

      </div>
    </Layout>
  );
}
