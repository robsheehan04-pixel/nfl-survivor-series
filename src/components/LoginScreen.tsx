import { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

// Decode JWT token to get user info
const decodeJwt = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
};

export function LoginScreen() {
  const { setUser, setError } = useStore();
  const [showDemoLogin, setShowDemoLogin] = useState(false);
  const [demoName, setDemoName] = useState('');
  const [demoEmail, setDemoEmail] = useState('');

  const handleSuccess = async (response: CredentialResponse) => {
    if (response.credential) {
      try {
        const decoded = decodeJwt(response.credential);
        // Role will be determined by database based on email
        await setUser({
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          role: 'user', // Default role, will be overwritten by database
        });
      } catch (err) {
        console.error('Failed to decode token:', err);
        setError('Failed to process login');
      }
    }
  };

  const handleError = () => {
    setError('Login failed. Please try again.');
  };

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName.trim() || !demoEmail.trim()) return;

    await setUser({
      id: `demo_${Date.now()}`,
      email: demoEmail.trim(),
      name: demoName.trim(),
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(demoName.trim())}&background=random&size=200`,
      role: 'user', // Demo users are always regular users
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full"
      >
        {/* Logo/Header */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-center mb-8"
        >
          <div className="inline-block mb-6">
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl rotate-6" />
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl -rotate-6" />
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full h-full flex items-center justify-center">
                <span className="text-4xl">🏈</span>
              </div>
            </div>
          </div>
          <h1 className="font-nfl text-4xl md:text-5xl text-white mb-2">
            NFL Survivor
          </h1>
          <h2 className="font-nfl text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400">
            Series
          </h2>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-white mb-2">
              Welcome Back
            </h3>
            <p className="text-gray-400">
              Sign in with Google to manage your survivor pools
            </p>
          </div>

          {/* Game Rules Summary */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                ✓
              </span>
              <span>Pick one team each week to win</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <span className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                ⚠
              </span>
              <span>You can't pick the same team twice</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <span className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                ❤
              </span>
              <span>2 lives - lose both and you're eliminated</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                ⏰
              </span>
              <span>Pick by Saturday 1PM or get the Vegas favorite</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              theme="filled_black"
              size="large"
              shape="rectangular"
              text="signin_with"
              locale="en"
            />
          </div>

          {/* Demo Login Option */}
          <div className="mt-6 pt-6 border-t border-white/10">
            {!showDemoLogin ? (
              <button
                onClick={() => setShowDemoLogin(true)}
                className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors"
              >
                Or continue with demo login
              </button>
            ) : (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleDemoLogin}
                className="space-y-3"
              >
                <input
                  type="text"
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  placeholder="Your name"
                  className="input-field"
                  required
                />
                <input
                  type="email"
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  placeholder="Your email"
                  className="input-field"
                  required
                />
                <button type="submit" className="w-full btn-primary">
                  Continue as Demo User
                </button>
                <button
                  type="button"
                  onClick={() => setShowDemoLogin(false)}
                  className="w-full text-sm text-gray-500 hover:text-gray-300"
                >
                  Cancel
                </button>
              </motion.form>
            )}
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-gray-500 text-sm mt-6"
        >
          Join or create survivor pools with friends
        </motion.p>
      </motion.div>
    </div>
  );
}
