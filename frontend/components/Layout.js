import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';

export default function Layout({ children }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
   
      <div className="fixed left-0 top-0 w-64 h-screen bg-slate-900 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-8">NordHavn</h1>

        <nav className="space-y-4 mb-12">
          <Link href="/dashboard">
            <div className={`px-4 py-2 rounded cursor-pointer ${router.pathname === '/dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              Dashboard
            </div>
          </Link>
          <Link href="/shipments">
            <div className={`px-4 py-2 rounded cursor-pointer ${router.pathname === '/shipments' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              Shipments
            </div>
          </Link>
          {user?.role === 'admin' && (
            <Link href="/manage-shipments">
              <div className={`px-4 py-2 rounded cursor-pointer ${router.pathname === '/manage-shipments' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                Manage Shipments
              </div>
            </Link>
          )}
        </nav>

        <div className="border-t border-slate-700 pt-4">
          <p className="text-sm text-slate-400 mb-2">Logged in as</p>
          <p className="text-white font-semibold mb-4">{user?.name}</p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="ml-64 p-8">
        {children}
      </div>
    </div>
  );
}
