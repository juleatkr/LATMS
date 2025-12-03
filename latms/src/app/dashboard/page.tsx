"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        leaveBalance: 24,
        pendingRequests: 0,
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <header className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                        Welcome back, {session?.user?.name || 'User'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Here is your leave and travel overview.</p>
                </div>
                <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => router.push('/dashboard/leave/new')}>+ New Request</button>
            </header>

            {/* Stats Grid */}
            <div className="grid-3" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
                <div className="stat-card" style={{ borderLeftColor: '#3b82f6', padding: '1.25rem' }}>
                    <p className="stat-label" style={{ fontSize: '0.8rem' }}>Annual Leave Balance</p>
                    <p className="stat-value" style={{ fontSize: '1.75rem' }}>{stats.leaveBalance} <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 400 }}>days</span></p>
                </div>
                <div className="stat-card" style={{ borderLeftColor: '#10b981', padding: '1.25rem' }}>
                    <p className="stat-label" style={{ fontSize: '0.8rem' }}>Ticket Eligibility</p>
                    <p className="stat-value" style={{ color: '#10b981', fontSize: '1.25rem' }}>Eligible</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>Annual Ticket (Economy)</p>
                </div>
                <div className="stat-card" style={{ borderLeftColor: '#f59e0b', padding: '1.25rem' }}>
                    <p className="stat-label" style={{ fontSize: '0.8rem' }}>Pending Requests</p>
                    <p className="stat-value" style={{ fontSize: '1.75rem' }}>{stats.pendingRequests}</p>
                </div>
            </div>

            {/* Recent Activity */}
            <section>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary)' }}>Recent Activity</h3>
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                    No recent leave or ticket requests found.
                </div>
            </section>
        </div>
    );
}
