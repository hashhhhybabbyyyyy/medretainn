import React, { useState } from 'react';
import { login, setToken, saveUser } from '../api';
import { Eye, EyeOff, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Please enter your username and password.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await login({ username, password });
            setToken(data.access_token);
            if (data.user) saveUser(data.user);
            onLogin();
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(ellipse at 60% 0%, rgba(37,99,235,0.06) 0%, #060912 60%)',
            padding: '48px 16px'
        }}>
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 64, height: 64, borderRadius: 12,
                        background: '#0a0a0a', border: '2px solid #00d48f', marginBottom: 12
                    }}>
                        <ShieldCheck size={28} color="#00d48f" />
                    </div>
                    <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, color: '#fff' }}>MedRetain</h1>
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: 13 }}>Patient retention dashboard</p>
                </div>

                <div style={{
                    background: '#000', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, padding: 32
                }}>
                    <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#fff' }}>Sign in to MedRetain CRM</h2>
                    <p style={{ margin: '0 0 20px', color: '#9ca3af', fontSize: 13 }}>Enter your CRM username and password to access the dashboard.</p>

                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', marginBottom: 18, background: 'rgba(239,68,68,0.06)', borderRadius: 12 }}>
                            <AlertCircle size={16} color="#ef4444" />
                            <span style={{ color: '#fca5a5', fontSize: 13 }}>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#9ca3af', marginBottom: 8 }}>Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                autoComplete="username"
                                autoFocus
                                disabled={loading}
                                style={{ width: '100%', padding: '10px 12px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#fff' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#9ca3af', marginBottom: 8 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    disabled={loading}
                                    style={{ width: '100%', padding: '10px 44px 10px 12px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#fff' }}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button id="login-submit" type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#00d48f', border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, cursor: 'pointer' }}>
                            {loading ? (
                                <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                                    <Loader2 size={16} /> Signing in...
                                </span>
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>
                    </form>

                    <p style={{ margin: '18px 0 0', textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>Your session is encrypted and secured with JWT tokens.</p>
                    <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
                        Use your MedRetain CRM credentials here. HIMS portal credentials belong in the Connect HIMS screen after login.
                    </p>
                    {import.meta.env.DEV && (
                        <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: 12, color: '#a3e635' }}>
                            Default CRM login: admin / medretain@admin123
                        </p>
                    )}
                </div>

                <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#6b7280' }}>© 2026 MedRetain · All rights reserved</p>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #4b5563; }
      `}</style>
        </div>
    );
};

export default LoginPage;
