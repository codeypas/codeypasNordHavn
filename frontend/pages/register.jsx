import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const googleRegister = useAuthStore((state) => state.googleRegister);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('manager');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const googleButtonRef = useRef(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isGoogleConfigured =
    !!googleClientId &&
    googleClientId !== 'your_google_oauth_client_id';

  useEffect(() => {
    if (!isGoogleConfigured) {
      setGoogleError('Add a valid Google client ID to enable Google signup.');
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
              setError('Google signup failed');
              return;
            }

            setError('');
            setSuccess('');
            setLoading(true);

            try {
              await googleRegister(response.credential);
              setSuccess('Google account created successfully as manager.');
              router.push('/dashboard');
            } catch (err) {
              setError(err?.message || 'Google signup failed');
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
          text: 'signup_with',
          shape: 'rectangular',
        });

        setGoogleError('');
        setIsGoogleReady(true);
      } catch (err) {
        setGoogleError('Unable to load Google signup right now.');
        setIsGoogleReady(false);
      }
    };

    const scriptSelector =
      'script[src="https://accounts.google.com/gsi/client"]';
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
      setGoogleError('Failed to load Google signup script.');
      setIsGoogleReady(false);
    };
    document.body.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [googleClientId, googleRegister, isGoogleConfigured, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await register(name, email, password, role);
      setSuccess('Registration successful. Redirecting to login...');
      
      setTimeout(() => {
        router.push('/login');
      }, 1500);

    } catch (err) {
      const message = err?.message || 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-white rounded-lg shadow-xl p-8 w-96">
        <h1 className="text-3xl font-bold text-center text-slate-900 mb-8">
          Register Account
        </h1>

        <form onSubmit={handleSubmit}>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              placeholder="manager@test.com"
              required
            />
          </div>

          <div className="mb-4">
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
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
                  Loading Google signup...
                </p>
              )}

              {googleError && (
                <p className="mt-3 text-center text-sm text-amber-700">
                  {googleError}
                </p>
              )}

              <p className="mt-3 text-center text-xs text-slate-500">
                Google signup creates a `manager` account automatically.
              </p>
            </>
          )}

          <p className="mt-4 text-sm text-center text-slate-600">
            Already have an account?{' '}
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => router.push('/login')}
            >
              Login
            </span>
          </p>

        </form>
      </div>
    </div>
  );
}
