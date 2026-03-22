import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const googleButtonRef = useRef(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isGoogleConfigured =
    !!googleClientId &&
    googleClientId !== 'your_google_oauth_client_id';

  const login = useAuthStore((state) => state.login);
  const googleLogin = useAuthStore((state) => state.googleLogin);

  useEffect(() => {
    if (!isGoogleConfigured) {
      setGoogleError('Add a valid Google client ID to enable Google login.');
      return undefined;
    }

    let cancelled = false;

    const initializeGoogle = () => {
      if (cancelled || !window.google || !googleButtonRef.current) {
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (!response.credential) {
              setError('Google login failed');
              return;
            }

            setError('');
            setLoading(true);

            try {
              await googleLogin(response.credential);
              router.push('/dashboard');
            } catch (err) {
              setError(err?.message || 'Google login failed');
            } finally {
              setLoading(false);
            }
          },
        });

        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
          shape: 'rectangular',
        });

        setGoogleError('');
        setIsGoogleReady(true);
      } catch (err) {
        setGoogleError('Unable to load Google login right now.');
        setIsGoogleReady(false);
      }
    };

    const scriptSelector =
      'script[src="https://accounts.google.com/gsi/client"]'
    const existingScript = document.querySelector(scriptSelector);

    if (existingScript) {
      if (window.google) {
        initializeGoogle();
      } else {
        existingScript.addEventListener('load', initializeGoogle, { once: true });
      }

      return () => {
        cancelled = true;
        existingScript.removeEventListener('load', initializeGoogle);
      };
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => {
      setGoogleError('Failed to load Google login script.');
      setIsGoogleReady(false);
    };
    document.body.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [googleClientId, googleLogin, isGoogleConfigured, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      const message = err?.message || 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-white rounded-lg shadow-xl p-8 w-96">
        <h1 className="text-3xl font-bold text-center text-slate-900 mb-8">
          Welcome To NordHavn Logistics
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              placeholder="admin@test.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              placeholder="password123"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {isGoogleConfigured && (
            <>
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Or
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="flex justify-center">
                <div ref={googleButtonRef} />
              </div>

              {!isGoogleReady && !googleError && (
                <p className="mt-3 text-center text-sm text-slate-500">
                  Loading Google login...
                </p>
              )}

              {googleError && (
                <p className="mt-3 text-center text-sm text-amber-700">
                  {googleError}
                </p>
              )}
            </>
          )}

          <p className="mt-4 text-sm text-center text-slate-600">
            Don't have an account?{' '}
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => router.push('/register')}
            >
              Register
            </span>
          </p>

        </form>
      </div>
    </div>
  );
}
