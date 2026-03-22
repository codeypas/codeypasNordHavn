import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '../store/authStore';
import { useShipmentStore } from '../store/shipmentStore';
import { useNotificationStore } from '../store/notificationStore';
import Layout from '../components/Layout';
import { generateAllShipmentsPDF } from '../utils/pdfGenerator';
import { useShipmentNotifications } from '../hooks/useShipmentNotifications';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const shipments = useShipmentStore((state) => state.shipments) || [];
  const fetchShipments = useShipmentStore((state) => state.fetchShipments);

  const addNotification = useNotificationStore((state) => state.addNotification);

  const [loading, setLoading] = useState(true);

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

  const handleDownloadPDF = () => {
    try {
      if (shipments.length === 0) {
        addNotification('No shipments to download', 'error');
        return;
      }

      generateAllShipmentsPDF(shipments);
      addNotification('PDF downloaded successfully!', 'success');
    } catch (error) {
      addNotification('Error generating PDF: ' + error.message, 'error');
    }
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      </Layout>
    );
  }

  const riskBreakdown = {
    low: shipments.filter((s) => s.riskScore < 30).length,
    medium: shipments.filter((s) => s.riskScore >= 30 && s.riskScore < 60).length,
    high: shipments.filter((s) => s.riskScore >= 60).length,
  };

  const etaBreakdown = {
    onTime: shipments.filter(
      (s) => s.delayPrediction?.label === 'Likely On Time'
    ).length,
    delayed: shipments.filter(
      (s) => s.delayPrediction?.label === 'Likely Delayed'
    ).length,
  };

  const statusBreakdown = {
    'In Transit': shipments.filter((s) => s.status === 'In Transit').length,
    'At Port': shipments.filter((s) => s.status === 'At Port').length,
    Delayed: shipments.filter((s) => s.status === 'Delayed').length,
    Completed: shipments.filter((s) => s.status === 'Completed').length,
  };

  const riskChartData = [
    { name: 'Low', value: riskBreakdown.low },
    { name: 'Medium', value: riskBreakdown.medium },
    { name: 'High', value: riskBreakdown.high },
  ];

  const statusChartData = Object.entries(statusBreakdown).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <Layout>
      <div className="space-y-6">

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome, {user.email}</p>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Download Report PDF
          </button>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-5 gap-4">

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-slate-600">Total Shipments</p>
            <p className="text-3xl font-bold">{shipments.length}</p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg shadow">
            <p className="text-green-700">Low Risk</p>
            <p className="text-3xl font-bold text-green-600">{riskBreakdown.low}</p>
          </div>

          <div className="bg-orange-50 p-6 rounded-lg shadow">
            <p className="text-orange-700">Medium Risk</p>
            <p className="text-3xl font-bold text-orange-600">{riskBreakdown.medium}</p>
          </div>

          <div className="bg-red-50 p-6 rounded-lg shadow">
            <p className="text-red-700">High Risk</p>
            <p className="text-3xl font-bold text-red-600">{riskBreakdown.high}</p>
          </div>

          <div className="bg-violet-50 p-6 rounded-lg shadow">
            <p className="text-violet-700">Predicted Delayed</p>
            <p className="text-3xl font-bold text-violet-600">{etaBreakdown.delayed}</p>
          </div>

        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="font-bold mb-4">Risk Distribution</h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={riskChartData} dataKey="value" outerRadius={100} label>
                  {riskChartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="font-bold mb-4">Shipments by Status</h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>

          </div>

        </div>

      </div>
    </Layout>
  );
}
