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
            background: 'radial-gradient(ellipse at 60% 0%, rgba(37,99,235,0.15) 0%, #060912 60%)',
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: '64px', height: '64px', borderRadius: '12px',
                                    background: '#000',
                                    border: '2px solid #00d48a',
                                    marginBottom: '20px',
                                }}>
                                    <ShieldCheck size={28} color="#00d48a" />
                                </div>
                                <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
                                    MedRetain
                                </h1>
                                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px', fontWeight: 500 }}>
                                    Patient retention dashboard
                                </p>
                {/* Logo / Brand */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '64px', height: '64px', borderRadius: '12px',
                        background: '#0a0a0a',
                        border: '2px solid #00d48f',
                        marginBottom: '16px',
                    }}>
                        <ShieldCheck size={32} color="#00d48f" />
                    </div>
                    <h1 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
                                <p style={{ margin: '0 0 24px', color: '#9ca3af', fontSize: '13px' }}>
                                    Sign in with your CRM account or connect a HIMS
                                </p>
                        Minimal Patient Retention Dashboard
                    </p>
                </div>

                {/* Card */}
                <div style={{
                        background: '#000',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '16px',
                        padding: '36px',
                    }}>
                    <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: '#fff' }}>
                        Sign in to your account
                    </h2>
                    <p style={{ margin: '0 0 24px', color: '#9ca3af', fontSize: '13px' }}>
                        Enter your HIMS portal credentials to continue
                    </p>

                    {/* Error banner */}
                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '14px 16px', marginBottom: '24px',
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            borderRadius: '14px',
                        }}>
                            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                            <span style={{ color: '#fca5a5', fontSize: '13px', fontWeight: 500 }}>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Username */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                autoComplete="username"
                                autoFocus
                                disabled={loading}
                                style={{
                                        width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                                        background: '#0a0a0a',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '10px', color: '#fff', fontSize: '15px',
                                        outline: 'none', transition: 'border-color 0.15s',
                                        fontFamily: 'inherit',
                                    }}
                                onFocus={(e) => e.target.style.borderColor = '#00d48f'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••"
                                    autoComplete="current-password"
                                    disabled={loading}
                                    style={{
                                            width: '100%', padding: '12px 48px 12px 14px', boxSizing: 'border-box',
                                            background: '#0a0a0a',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '10px', color: '#fff', fontSize: '15px',
                                            outline: 'none', transition: 'border-color 0.15s',
                                            fontFamily: 'inherit',
                                        }}
                                    onFocus={(e) => e.target.style.borderColor = '#00d48f'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#6b7280', padding: 0, display: 'flex', alignItems: 'center',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '12px',
                                    background: loading ? '#033' : '#00d48f',
                                    border: 'none', borderRadius: '10px',
                                    color: '#000', fontSize: '15px', fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                transition: 'all 0.2s',
                                boxShadow: loading ? 'none' : '0 8px 32px rgba(79,70,229,0.3)',
                                fontFamily: 'inherit',
                                letterSpacing: '0.01em',
                            }}
                        >
                            {loading ? (
                            <p style={{ textAlign: 'center', margin: '20px 0 0', fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                                © 2026 MedRetain · All rights reserved
                            </p>
                                </>
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>
                    </form>

                    {/* Footer note */}
                    <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: '12px', color: '#9ca3af', lineHeight: 1.6 }}>
                        Your session is encrypted and secured with JWT tokens.
                    </p>
                </div>

                {/* Bottom branding */}
                <p style={{ textAlign: 'center', margin: '20px 0 0', fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                    © 2026 MedRetain · All rights reserved
                </p>
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
