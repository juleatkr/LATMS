"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LeaveRequest {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    days: number;
    status: string;
    reason: string;
    user: {
        name: string;
        email: string;
        department: string;
    };
    ticketRequest: any;
    managerApprovedBy?: string;
    managerApprovedAt?: string;
    hrApprovedBy?: string;
    hrApprovedAt?: string;
    managementApprovedBy?: string;
    managementApprovedAt?: string;
}

export default function AdminApprovalsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchRequests();
        }
    }, [status, router]);

    const fetchRequests = async () => {
        try {
            const response = await fetch("/api/admin/leave");
            if (response.ok) {
                const data = await response.json();
                setRequests(data);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
        try {
            const response = await fetch("/api/admin/leave/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, action }),
            });

            if (response.ok) {
                alert(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
                fetchRequests(); // Refresh the list
            } else {
                alert("Failed to process request.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred.");
        }
    };

    const handleNotifyEmployee = (req: LeaveRequest, status: 'APPROVED' | 'REJECTED') => {
        const subject = `${req.user.email.split('@')[0].toUpperCase()} | ${req.type} | ${req.user.name.toUpperCase()} | ${status}`;

        const body = `Dear ${req.user.name},%0D%0A%0D%0A` +
            `Your leave request has been ${status.toLowerCase()}.%0D%0A%0D%0A` +
            `LEAVE DETAILS%0D%0A` +
            `Leave Type: ${req.type}%0D%0A` +
            `Dates: ${formatDate(req.startDate)} - ${formatDate(req.endDate)} (${req.days} days)%0D%0A` +
            `Status: ${status}%0D%0A%0D%0A` +
            (req.ticketRequest ? `TICKET REQUEST%0D%0A` +
                `Route: ${req.ticketRequest.route}%0D%0A` +
                `Ticket Status: ${req.ticketRequest.status}%0D%0A%0D%0A` : '') +
            `Reason: ${req.reason || 'N/A'}%0D%0A%0D%0A` +
            `Best regards,%0D%0AHR Department`;

        const mailtoLink = `mailto:${req.user.email}?subject=${encodeURIComponent(subject)}&body=${body}`;
        window.open(mailtoLink, '_blank');
    };

    const handleNotifyNextApprover = (req: LeaveRequest) => {
        let nextApprover = 'manager@al-obaidani.com';
        let approverType = 'MANAGER';

        if (req.status === 'PENDING_HR') {
            nextApprover = 'hr@al-obaidani.com';
            approverType = 'HR';
        } else if (req.status === 'PENDING_MANAGEMENT') {
            nextApprover = 'management@al-obaidani.com';
            approverType = 'MANAGEMENT';
        }

        const subject = `${req.user.email.split('@')[0].toUpperCase()} | ${req.type} | ${req.user.name.toUpperCase()} | PENDING ${approverType} APPROVAL`;

        const body = `Dear ${approverType},%0D%0A%0D%0A` +
            `A new leave request requires your approval.%0D%0A%0D%0A` +
            `EMPLOYEE DETAILS%0D%0A` +
            `Name: ${req.user.name}%0D%0A` +
            `Email: ${req.user.email}%0D%0A` +
            `Department: ${req.user.department}%0D%0A%0D%0A` +
            `LEAVE DETAILS%0D%0A` +
            `Leave Type: ${req.type}%0D%0A` +
            `Dates: ${formatDate(req.startDate)} - ${formatDate(req.endDate)} (${req.days} days)%0D%0A` +
            `Reason: ${req.reason || 'N/A'}%0D%0A%0D%0A` +
            (req.ticketRequest ? `TICKET REQUEST%0D%0A` +
                `Route: ${req.ticketRequest.route}%0D%0A%0D%0A` : '') +
            `Please review and approve/reject this request.%0D%0A%0D%0A` +
            `Best regards,%0D%0ALeave Management System`;

        const mailtoLink = `mailto:${nextApprover}?subject=${encodeURIComponent(subject)}&body=${body}`;
        window.open(mailtoLink, '_blank');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const calculateBalanceAfter = (days: number) => {
        return 30 - days; // Simplified for demo
    };

    if (loading || status === "loading") {
        return <div>Loading...</div>;
    }

    const pendingRequests = requests.filter(r => r.status.includes('PENDING'));

    return (
        <div>
            <header className="dashboard-header">
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>Leave Approvals</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Review and process pending leave applications.</p>
                </div>
            </header>

            {pendingRequests.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                    No pending approval requests.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {pendingRequests.map((req) => (
                        <div key={req.id} className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary)' }}>{req.user.name}</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{req.user.department} • {req.user.email}</p>
                                </div>
                                <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                                    {req.status.replace('PENDING_', '')}
                                </span>
                            </div>

                            <div className="grid-3" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                <div>
                                    <p style={{ color: 'var(--text-light)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>Leave Type</p>
                                    <p style={{ fontWeight: 500 }}>{req.type}</p>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-light)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>Dates</p>
                                    <p style={{ fontWeight: 500 }}>{formatDate(req.startDate)} - {formatDate(req.endDate)} ({req.days} Days)</p>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-light)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>Balance After</p>
                                    <p style={{ fontWeight: 500, color: '#16a34a' }}>{calculateBalanceAfter(req.days)} Days Remaining</p>
                                </div>
                            </div>

                            {req.ticketRequest && (
                                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                    <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>✈️ Ticket Request:</p>
                                    <p style={{ color: 'var(--text-muted)' }}>{req.ticketRequest.route}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>Status: {req.ticketRequest.status}</p>
                                </div>
                            )}

                            {req.reason && (
                                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                    <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>📝 Reason:</p>
                                    <p style={{ color: 'var(--text-muted)' }}>{req.reason}</p>
                                </div>
                            )}

                            {/* Approval History */}
                            {(req.managerApprovedBy || req.hrApprovedBy || req.managementApprovedBy) && (
                                <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.8125rem', border: '1px solid #bbf7d0' }}>
                                    <p style={{ fontWeight: 600, color: '#166534', marginBottom: '0.75rem' }}>✓ Approval History</p>
                                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                                        {req.managerApprovedBy && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#15803d' }}>1️⃣ Manager: <strong>{req.managerApprovedBy}</strong></span>
                                                <span style={{ color: '#65a30d', fontSize: '0.75rem' }}>{req.managerApprovedAt ? formatDate(req.managerApprovedAt) : ''}</span>
                                            </div>
                                        )}
                                        {req.hrApprovedBy && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#15803d' }}>2️⃣ HR: <strong>{req.hrApprovedBy}</strong></span>
                                                <span style={{ color: '#65a30d', fontSize: '0.75rem' }}>{req.hrApprovedAt ? formatDate(req.hrApprovedAt) : ''}</span>
                                            </div>
                                        )}
                                        {req.managementApprovedBy && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#15803d' }}>3️⃣ Management: <strong>{req.managementApprovedBy}</strong></span>
                                                <span style={{ color: '#65a30d', fontSize: '0.75rem' }}>{req.managementApprovedAt ? formatDate(req.managementApprovedAt) : ''}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', flexWrap: 'wrap' }}>
                                <button
                                    className="btn btn-primary"
                                    style={{ backgroundColor: '#16a34a', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                    onClick={() => handleAction(req.id, 'approve')}
                                >
                                    Approve & Forward
                                </button>
                                <button
                                    className="btn btn-outline"
                                    style={{ color: '#dc2626', borderColor: '#fecaca', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                    onClick={() => handleAction(req.id, 'reject')}
                                >
                                    Reject
                                </button>
                                <button
                                    className="btn btn-outline"
                                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                    onClick={() => handleNotifyNextApprover(req)}
                                >
                                    📧 Notify Next Approver
                                </button>
                                <button
                                    className="btn btn-outline"
                                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                    onClick={() => handleNotifyEmployee(req, 'REJECTED')}
                                >
                                    📧 Send Rejection Email
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
