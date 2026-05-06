import { Truck, LogIn, ShieldCheck, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onLoginSuccess();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#09090b]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
            <Truck className="text-orange-500" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Gateway</h1>
          <p className="text-zinc-400 mt-2">Indian Delivery <span className="text-orange-500 italic">Ltd</span> Internal Systems</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                <div className="mt-1">
                  <ShieldCheck size={18} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Authorized Access Only</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">This portal is restricted to employees of Indian Delivery Ltd. All actions are logged and strictly monitored.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-12 bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-700 disabled:opacity-50 text-orange-950 font-bold rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-orange-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Signin with Google</span>
                </>
              )}
            </button>

            <div className="pt-4 flex items-center justify-center gap-2 text-zinc-500">
              <Globe size={14} />
              <p className="text-[10px] font-bold uppercase tracking-widest">Secure Global Network</p>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-zinc-600 mt-8 font-bold uppercase tracking-widest">
          © 2024 Indian Delivery Ltd • Corporate Security Division
        </p>
      </motion.div>
    </div>
  );
}
