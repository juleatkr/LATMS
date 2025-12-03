"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1 className="sidebar-brand">
                        <span style={{ color: 'var(--accent)' }}>Al Obaidani</span> LATMS
                    </h1>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                        Employee Portal
                    </p>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-section-label">
                        Menu
                    </div>
                    <Link href="/dashboard" className="sidebar-link">
                        📊 Dashboard
                    </Link>
                    <Link href="/dashboard/leave/new" className="sidebar-link">
                        📅 Apply for Leave
                    </Link>
                    <Link href="/dashboard/requests" className="sidebar-link">
                        📂 My Requests
                    </Link>

                    <div className="sidebar-section-label" style={{ marginTop: '2rem' }}>
                        Supervisor
                    </div>
                    <Link href="/dashboard/leave/post-for-team" className="sidebar-link">
                        👥 Post Leave for Team
                    </Link>

                    <div className="sidebar-section-label" style={{ marginTop: '2rem' }}>
                        Travel
                    </div>
                    <Link href="/dashboard/tickets" className="sidebar-link">
                        ✈️ My Tickets
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="avatar">
                            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white' }}>
                                {session?.user?.name || 'User'}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                                {session?.user?.email || ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="logout-btn"
                    >
                        🚪 Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
