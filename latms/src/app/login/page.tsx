"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email: email,
                password: password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid credentials");
                setLoading(false);
            } else {
                // Fetch session to check role for redirection
                const session = await getSession();
                // @ts-ignore
                if (session?.user?.role === 'ADMIN' || session?.user?.role === 'HR' || session?.user?.role === 'ACCOUNTS') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                {/* Company Logo/Brand */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 1.5rem',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: 'white',
                        boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)'
                    }}>
                        AO
                    </div>
                    <h1 style={{
                        fontSize: '1.875rem',
                        marginBottom: '0.5rem',
                        fontWeight: '700',
                        color: 'var(--primary)'
                    }}>
                        Welcome Back
                    </h1>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.95rem'
                    }}>
                        Sign in to Al Obaidani LATMS
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: 'var(--radius-md)',
                        color: '#991b1b',
                        fontSize: '0.875rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            placeholder="employee@al-obaidani.com"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            marginTop: '1.5rem',
                            padding: '0.875rem',
                            fontSize: '1rem',
                            fontWeight: '600'
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <span style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid white',
                                    borderTopColor: 'transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 0.6s linear infinite'
                                }}></span>
                                Signing In...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>


            </div>

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
