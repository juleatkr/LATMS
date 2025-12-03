"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Ticket {
    id: string;
    route: string;
    selectedQuote: string;
    status: string;
    leaveRequest: {
        startDate: string;
        endDate: string;
    };
}

export default function MyTicketsPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await fetch("/api/tickets");
            if (response.ok) {
                const data = await response.json();
                setTickets(data);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <header className="dashboard-header">
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>My Tickets</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Access your issued e-tickets and travel documents.</p>
                </div>
            </header>

            {tickets.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ width: '4rem', height: '4rem', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontSize: '1.5rem' }}>
                        🎫
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>No Active Tickets</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '28rem', margin: '0.5rem auto 0 auto' }}>
                        You don't have any upcoming travel bookings. Once your leave with ticket request is approved, your e-tickets will appear here.
                    </p>
                    <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => router.push('/dashboard/leave/new')}>
                        Apply for Leave & Ticket
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {tickets.map((ticket) => {
                        const quote = ticket.selectedQuote ? JSON.parse(ticket.selectedQuote) : null;
                        return (
                            <div key={ticket.id} className="card" style={{ borderLeft: '4px solid #10b981' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                                            {ticket.route}
                                        </h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            Travel Period: {formatDate(ticket.leaveRequest.startDate)} - {formatDate(ticket.leaveRequest.endDate)}
                                        </p>
                                    </div>
                                    <span style={{
                                        backgroundColor: ticket.status === 'SETTLED' ? '#dcfce7' : ticket.status === 'SETTLEMENT_READY' ? '#f3e8ff' : '#dcfce7',
                                        color: ticket.status === 'SETTLED' ? '#166534' : ticket.status === 'SETTLEMENT_READY' ? '#6b21a8' : '#166534',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px'
                                    }}>
                                        {ticket.status === 'TICKET_ISSUED' ? '✓ Issued' : ticket.status === 'SETTLEMENT_READY' ? '💰 Settlement Ready' : '✓ Settled'}
                                    </span>
                                </div>

                                {quote && (
                                    <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
                                            <div>
                                                <p style={{ color: 'var(--text-light)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Airline</p>
                                                <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>{quote.airline}</p>
                                            </div>
                                            <div>
                                                <p style={{ color: 'var(--text-light)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Flight</p>
                                                <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>{quote.departure}</p>
                                            </div>
                                            <div>
                                                <p style={{ color: 'var(--text-light)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Type</p>
                                                <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>{quote.type}</p>
                                            </div>
                                            <div>
                                                <p style={{ color: 'var(--text-light)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Baggage</p>
                                                <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>{quote.baggage}</p>
                                            </div>
                                            <div>
                                                <p style={{ color: 'var(--text-light)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Status</p>
                                                <p style={{ fontWeight: 600, color: quote.refundable ? '#16a34a' : '#d97706' }}>
                                                    {quote.refundable ? 'Refundable' : 'Non-Refundable'}
                                                </p>
                                            </div>
                                            <div>
                                                <p style={{ color: 'var(--text-light)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Price</p>
                                                <p style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary)' }}>OMR {quote.price.toFixed(3)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                    <button className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                                        📄 Download E-Ticket
                                    </button>
                                    <button className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
                                        ✉️ Email Copy
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
