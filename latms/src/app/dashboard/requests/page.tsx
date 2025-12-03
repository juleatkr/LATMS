"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface LeaveRequest {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    days: number;
    status: string;
    reason: string;
    createdAt: string;
    user: {
        name: string;
        staffCode: string;
        department: string;
    };
    ticketRequest?: {
        id: string;
        status: string;
        route: string;
    };
}

export default function MyRequestsPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        fetchRequests();
    }, [statusFilter, typeFilter, fromDate, toDate]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'All') params.append('status', statusFilter);
            if (typeFilter !== 'All') params.append('type', typeFilter);
            if (fromDate) params.append('fromDate', fromDate);
            if (toDate) params.append('toDate', toDate);

            const res = await fetch(`/api/leave-requests?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'PENDING_MANAGER': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'PENDING_HR': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'PENDING_MANAGEMENT': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                        My Requests
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Manage and track your leave and ticket applications.
                    </p>
                </div>
                <Link href="/dashboard/leave/new" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                    + New Request
                </Link>
            </header>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'white' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label className="form-label" style={{ marginBottom: '0.25rem' }}>Status</label>
                        <select
                            className="form-input"
                            style={{ padding: '0.5rem' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="PENDING_MANAGER">Pending Manager</option>
                            <option value="PENDING_HR">Pending HR</option>
                            <option value="PENDING_MANAGEMENT">Pending Management</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label className="form-label" style={{ marginBottom: '0.25rem' }}>Leave Type</label>
                        <select
                            className="form-input"
                            style={{ padding: '0.5rem' }}
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="All">All Types</option>
                            <option value="Annual Leave">Annual Leave</option>
                            <option value="Sick Leave">Sick Leave</option>
                            <option value="Emergency Leave">Emergency Leave</option>
                            <option value="Unpaid Leave">Unpaid Leave</option>
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label className="form-label" style={{ marginBottom: '0.25rem' }}>From Date</label>
                        <input
                            type="date"
                            className="form-input"
                            style={{ padding: '0.5rem' }}
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label className="form-label" style={{ marginBottom: '0.25rem' }}>To Date</label>
                        <input
                            type="date"
                            className="form-input"
                            style={{ padding: '0.5rem' }}
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <button
                        className="btn btn-outline"
                        style={{ height: '38px', padding: '0 1rem' }}
                        onClick={() => {
                            setStatusFilter("All");
                            setTypeFilter("All");
                            setFromDate("");
                            setToDate("");
                        }}
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Requests List */}
            {loading ? (
                <div className="text-center p-8">Loading requests...</div>
            ) : requests.length === 0 ? (
                <div className="card text-center p-8">
                    <p className="text-slate-500">No requests found matching your filters.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {requests.map((req) => (
                        <div key={req.id} className="card" style={{
                            padding: '1rem',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1.5fr 1fr 1fr auto',
                            gap: '1rem',
                            alignItems: 'center',
                            borderLeft: `4px solid ${req.status === 'APPROVED' ? '#22c55e' :
                                req.status === 'REJECTED' ? '#ef4444' : '#eab308'
                                }`
                        }}>
                            {/* User Info (if supervisor viewing) or Type */}
                            <div>
                                <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{req.type}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {req.user.name} ({req.user.staffCode})
                                </div>
                            </div>

                            {/* Dates & Duration */}
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                                    {formatDate(req.startDate)} - {formatDate(req.endDate)}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {req.days} Days • {req.reason}
                                </div>
                            </div>

                            {/* Ticket Info */}
                            <div>
                                {req.ticketRequest ? (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        fontSize: '0.8rem',
                                        padding: '0.25rem 0.5rem',
                                        background: '#eff6ff',
                                        color: '#1e40af',
                                        borderRadius: '4px'
                                    }}>
                                        ✈️ {req.ticketRequest.route}
                                    </span>
                                ) : (
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No Ticket</span>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    textTransform: 'uppercase',
                                    backgroundColor: req.status.includes('APPROVED') ? '#dcfce7' :
                                        req.status.includes('REJECTED') ? '#fee2e2' : '#fef9c3',
                                    color: req.status.includes('APPROVED') ? '#166534' :
                                        req.status.includes('REJECTED') ? '#991b1b' : '#854d0e'
                                }}>
                                    {req.status.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Actions */}
                            <div>
                                <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                                    View
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
