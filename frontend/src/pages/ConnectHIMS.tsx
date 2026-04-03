import React, { useState } from 'react';
import { connectHIMS } from '../api';
import { ShieldCheck, Database, Server, Loader2, Hospital } from 'lucide-react';

interface ConnectHIMSProps {
    onConnected: () => void;
}

const ConnectHIMS: React.FC<ConnectHIMSProps> = ({ onConnected }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [himsName, setHimsName] = useState('Doctor 24/7');
    const [hospitalId, setHospitalId] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isDBMode, setIsDBMode] = useState(false);
    const [host, setHost] = useState('');

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const credentials: any = { username, password };
        if (isDBMode) {
            credentials.host = host;
        }

        try {
            await connectHIMS({
                hospital_id: hospitalId,
                hims_name: himsName,
                credentials
            });
            onConnected();
        } catch (err: any) {
            setError(err.message || 'Connection failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-black border border-[#003927] mb-4 shadow-sm">
                        <ShieldCheck className="w-9 h-9 text-[#00d48a]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                        MedRetain
                    </h1>
                    <p className="text-slate-400 text-sm">Connect your HIMS to sync patient data</p>
                </div>

                <div className="bg-[#000] border border-white/6 rounded-2xl p-6">
                    <form onSubmit={handleConnect} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">HIMS Platform</label>
                            <div className="relative">
                                <select
                                    value={himsName}
                                    onChange={(e) => setHimsName(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00d48a]/50 transition-all appearance-none"
                                >
                                    <option>Doctor 24/7</option>
                                    <option>InstaHealth</option>
                                    <option>EPRO</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Database className="w-5 h-5 text-slate-500" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Hospital ID</label>
                                <input
                                    type="text"
                                    placeholder="H-1029"
                                    value={hospitalId}
                                    onChange={(e) => setHospitalId(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00d48a]/50 transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Auth Type</label>
                                <button
                                    type="button"
                                    onClick={() => setIsDBMode(!isDBMode)}
                                    className={`w-full py-3 rounded-2xl border transition-all font-medium flex items-center justify-center gap-2 ${isDBMode ? 'bg-[#07110f] border-[#003927] text-[#00d48a]' : 'bg-[#0a0a0a] border-white/10 text-slate-300'}`}
                                >
                                    {isDBMode ? <Server className="w-4 h-4" /> : <Loader2 className="w-4 h-4" />}
                                    {isDBMode ? 'Direct DB' : 'REST API'}
                                </button>
                            </div>
                        </div>

                        {isDBMode && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Database Host</label>
                                <input
                                    type="text"
                                    placeholder="db.hospital.com"
                                    value={host}
                                    onChange={(e) => setHost(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00d48a]/50 transition-all font-mono text-sm"
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Username / Client ID</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Password / Client Secret</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00d48a]/50 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#00d48a] text-black font-bold py-3 rounded-2xl shadow-sm active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Hospital className="w-6 h-6 text-black" />}
                            {loading ? 'Authenticating...' : 'Connect HIMS'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#00d48a]/80" />
                        Encrypted connection
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConnectHIMS;
