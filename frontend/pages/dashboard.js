import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { useShipmentStore } from '../store/shipmentStore';
import Layout from '../components/Layout';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const shipments = useShipmentStore((state) => state.shipments);
  const fetchShipments = useShipmentStore((state) => state.fetchShipments);
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
    if (token) {
      fetchShipments(token);
    }
  }, [token]);

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const riskDistribution = [
    { name: 'Low (0-30)', value: shipments.filter((s) => s.riskScore < 30).length },
    { name: 'Medium (30-60)', value: shipments.filter((s) => s.riskScore >= 30 && s.riskScore < 60).length },
    { name: 'High (60+)', value: shipments.filter((s) => s.riskScore >= 60).length },
  ];

  const statusDistribution = shipments.reduce((acc, s) => {
    const existing = acc.find((item) => item.name === s.status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: s.status, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  const unusualCount = shipments.filter((s) => s.isUnusual).length;
  const highSeverityUnusualCount = shipments.filter((s) => s.anomalySeverity === 'high').length;

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-slate-600 text-sm font-medium">Total Shipments</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{shipments.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-slate-600 text-sm font-medium">High Risk</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{shipments.filter((s) => s.riskScore >= 60).length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-slate-600 text-sm font-medium">In Transit</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{shipments.filter((s) => s.status === 'In Transit').length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-slate-600 text-sm font-medium">Avg Compliance</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {shipments.length > 0
                ? Math.round(shipments.reduce((acc, s) => acc + s.compliancePercentage, 0) / shipments.length)
                : 0}
              %
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-slate-600 text-sm font-medium">Unusual Patterns</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{unusualCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-slate-600 text-sm font-medium">Critical Unusual</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{highSeverityUnusualCount}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Risk Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={riskDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusDistribution}>
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
