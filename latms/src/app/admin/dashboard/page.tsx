"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        pendingApprovals: 0,
        employeesOnLeave: 0,
        pendingTickets: 0,
        monthlyTicketCost: '0',
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchStats();
        }
    }, [status, router]);

    const fetchStats = async () => {
        try {
            const response = await fetch("/api/admin/leave");
            if (response.ok) {
                const requests = await response.json();
                const pendingCount = requests.filter((r: any) => r.status.includes('PENDING')).length;
                const approvedCount = requests.filter((r: any) => r.status === 'APPROVED').length;
                const ticketCount = requests.filter((r: any) => r.ticketRequest).length;

                setStats({
                    pendingApprovals: pendingCount,
                    employeesOnLeave: approvedCount,
                    pendingTickets: ticketCount,
                    monthlyTicketCost: 'OMR 2,450',
                });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <header className="dashboard-header">
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>Admin Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Overview of leave trends and ticket costs.</p>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '3rem' }}>
                <div className="stat-card primary">
                    <p className="stat-label">Pending Approvals</p>
                    <p className="stat-value">{stats.pendingApprovals}</p>
                </div>
                <div className="stat-card accent">
                    <p className="stat-label">Employees on Leave</p>
                    <p className="stat-value" style={{ color: 'var(--accent)' }}>{stats.employeesOnLeave}</p>
                </div>
                <div className="stat-card warning">
                    <p className="stat-label">Pending Tickets</p>
                    <p className="stat-value" style={{ color: 'var(--warning)' }}>{stats.pendingTickets}</p>
                </div>
                <div className="stat-card success">
                    <p className="stat-label">Monthly Ticket Cost</p>
                    <p className="stat-value" style={{ color: 'var(--success)' }}>{stats.monthlyTicketCost}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <section className="card">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => router.push('/admin/approvals')}
                    >
                        View Pending Approvals
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={() => router.push('/admin/tickets')}
                    >
                        Manage Tickets
                    </button>
                </div>
            </section>
        </div>
    );
}
