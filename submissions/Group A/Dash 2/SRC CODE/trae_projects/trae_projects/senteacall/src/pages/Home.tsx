
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex flex-col items-center justify-center p-4 text-white font-sans">
      <div className="max-w-2xl text-center space-y-8">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-full shadow-lg shadow-blue-500/50">
            <ShieldCheck className="w-16 h-16 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl font-extrabold tracking-tight">
          SentiCall <span className="text-blue-400">Security</span>
        </h1>
        
        <p className="text-xl text-gray-300 max-w-lg mx-auto leading-relaxed">
          Advanced real-time Voice AI protection against social engineering, fraud, and impersonation scams.
        </p>
        
        <div className="pt-8">
          <Link 
            to="/dashboard" 
            className="group inline-flex items-center space-x-3 bg-white text-blue-900 hover:bg-blue-50 font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-xl"
          >
            <span>Launch Protection Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-400">
          <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <strong className="block text-white mb-1">Real-time Analysis</strong>
            &lt;500ms latency detection
          </div>
          <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <strong className="block text-white mb-1">Silent Protection</strong>
            Non-intrusive monitoring
          </div>
          <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <strong className="block text-white mb-1">Bank-Grade Security</strong>
            Encrypted processing
          </div>
        </div>
      </div>
    </div>
  );
}
