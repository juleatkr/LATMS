"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface TicketRequest {
    id: string;
    route: string;
    status: string;
    quotes: string | null;
    selectedQuote: string | null;
    leaveRequest: {
        id: string;
        type: string;
        user: {
            staffCode: string;
            name: string;
            email: string;
            department: string;
            location: string;
            ticketEligible: boolean;
        };
        startDate: string;
        endDate: string;
        days: number;
        status: string;
        reason: string;
    };
}

interface Quote {
    airline: string;
    price: number;
    type: string;
    departure: string;
    baggage: string;
    refundable: boolean;
}

export default function AdminTicketCenterPage() {
    const { data: session, status } = useSession();
    // @ts-ignore
    const userRole = session?.user?.role;
    const router = useRouter();
    const [tickets, setTickets] = useState<TicketRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTicket, setEditingTicket] = useState<TicketRequest | null>(null);
    const [viewingTicket, setViewingTicket] = useState<TicketRequest | null>(null);
    const [issuingQuote, setIssuingQuote] = useState<{ ticket: TicketRequest, quote: Quote } | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchTickets();
        }
    }, [status, router]);

    const fetchTickets = async () => {
        try {
            const response = await fetch("/api/admin/tickets");
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

    const handleRequestQuote = async (ticket: TicketRequest) => {
        const subject = `${ticket.leaveRequest.user.staffCode} | ${ticket.route} | ${ticket.leaveRequest.user.name.toUpperCase()} | ${ticket.leaveRequest.user.ticketEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`;

        const body = `Please provide quotes for the following request:%0D%0A%0D%0A` +
            `PASSENGER DETAILS%0D%0A` +
            `Name: ${ticket.leaveRequest.user.name} (Staff Code: ${ticket.leaveRequest.user.staffCode})%0D%0A` +
            `Department: ${ticket.leaveRequest.user.department}%0D%0A` +
            `Location: ${ticket.leaveRequest.user.location}%0D%0A` +
            `Ticket Eligibility: ${ticket.leaveRequest.user.ticketEligible ? 'Yes' : 'No'}%0D%0A%0D%0A` +
            `TRAVEL DETAILS%0D%0A` +
            `Route: ${ticket.route}%0D%0A` +
            `Dates: ${new Date(ticket.leaveRequest.startDate).toLocaleDateString()} - ${new Date(ticket.leaveRequest.endDate).toLocaleDateString()} (${ticket.leaveRequest.days} days)%0D%0A` +
            `Leave Type: ${ticket.leaveRequest.type}%0D%0A` +
            `Reason/Notes: ${ticket.leaveRequest.reason || 'N/A'}`;

        const mailtoLink = `mailto:travel-agent@example.com?subject=${encodeURIComponent(subject)}&body=${body}`;
        window.open(mailtoLink, '_blank');
    };

    const handleOpenPriceEntry = (ticket: TicketRequest) => {
        setEditingTicket(ticket);
        if (ticket.quotes) {
            setQuotes(JSON.parse(ticket.quotes));
        } else {
            setQuotes([{ airline: '', price: 0, type: 'Direct', departure: '', baggage: '', refundable: true }]);
        }
    };

    const addQuote = () => {
        if (quotes.length < 3) {
            setQuotes([...quotes, { airline: '', price: 0, type: 'Direct', departure: '', baggage: '', refundable: true }]);
        }
    };

    const removeQuote = (index: number) => {
        const newQuotes = [...quotes];
        newQuotes.splice(index, 1);
        setQuotes(newQuotes);
    };

    const updateQuote = (index: number, field: keyof Quote, value: any) => {
        const newQuotes = [...quotes];
        newQuotes[index] = { ...newQuotes[index], [field]: value };
        setQuotes(newQuotes);
    };

    const handleSaveQuotes = async () => {
        if (!editingTicket) return;

        try {
            const response = await fetch(`/api/admin/tickets/${editingTicket.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'QUOTE_RECEIVED',
                    quotes: JSON.stringify(quotes)
                })
            });

            if (response.ok) {
                const updatedTicket = await response.json();
                setTickets(tickets.map(t => t.id === editingTicket.id ? updatedTicket : t));
                setEditingTicket(null);
            } else {
                alert('Failed to save quotes');
            }
        } catch (error) {
            console.error('Error saving quotes:', error);
            alert('An error occurred');
        }
    };

    const handleIssueTicket = async (ticket: TicketRequest, selectedQuote: Quote) => {
        // Open email to travel agent with the selected quote
        const subject = `${ticket.leaveRequest.user.staffCode} | ${ticket.route} | ${ticket.leaveRequest.user.name.toUpperCase()} | ISSUE TICKET`;

        const body = `Dear Travel Agent,%0D%0A%0D%0A` +
            `Please issue the air ticket for the following passenger with the selected quote.%0D%0A%0D%0A` +
            `PASSENGER DETAILS%0D%0A` +
            `Name: ${ticket.leaveRequest.user.name}%0D%0A` +
            `Staff Code: ${ticket.leaveRequest.user.staffCode}%0D%0A` +
            `Email: ${ticket.leaveRequest.user.email}%0D%0A` +
            `Department: ${ticket.leaveRequest.user.department}%0D%0A` +
            `Location: ${ticket.leaveRequest.user.location}%0D%0A%0D%0A` +
            `TRAVEL DETAILS%0D%0A` +
            `Route: ${ticket.route}%0D%0A` +
            `Travel Dates: ${new Date(ticket.leaveRequest.startDate).toLocaleDateString()} - ${new Date(ticket.leaveRequest.endDate).toLocaleDateString()} (${ticket.leaveRequest.days} days)%0D%0A` +
            `Leave Type: ${ticket.leaveRequest.type}%0D%0A%0D%0A` +
            `SELECTED QUOTE%0D%0A` +
            `Airline: ${selectedQuote.airline}%0D%0A` +
            `Price: OMR ${selectedQuote.price.toFixed(3)}%0D%0A` +
            `Flight Type: ${selectedQuote.type}%0D%0A` +
            `Departure Time: ${selectedQuote.departure}%0D%0A` +
            `Baggage: ${selectedQuote.baggage}%0D%0A` +
            `Refundable: ${selectedQuote.refundable ? 'Yes' : 'No'}%0D%0A%0D%0A` +
            `Please proceed with ticket issuance and send confirmation.%0D%0A%0D%0A` +
            `Best regards,%0D%0AHR Department`;

        const mailtoLink = `mailto:travel-agent@example.com?subject=${encodeURIComponent(subject)}&body=${body}`;
        window.open(mailtoLink, '_blank');

        // Open confirmation modal
        setIssuingQuote({ ticket, quote: selectedQuote });
    };

    const confirmIssueTicket = async () => {
        if (!issuingQuote) return;

        const { ticket, quote } = issuingQuote;

        try {
            const response = await fetch(`/api/admin/tickets/${ticket.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'TICKET_ISSUED',
                    selectedQuote: JSON.stringify(quote)
                })
            });

            if (response.ok) {
                const updatedTicket = await response.json();
                setTickets(tickets.map(t => t.id === ticket.id ? updatedTicket : t));
                setIssuingQuote(null);
            }
        } catch (error) {
            console.error('Error issuing ticket:', error);
        }
    };

    const handleMarkAsIssued = async (ticket: TicketRequest) => {
        if (confirm('Confirm that the physical ticket has been received from the travel agent and is ready for the employee?')) {
            try {
                const response = await fetch(`/api/admin/tickets/${ticket.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: 'TICKET_ISSUED'
                    })
                });

                if (response.ok) {
                    const updatedTicket = await response.json();
                    setTickets(tickets.map(t => t.id === ticket.id ? updatedTicket : t));
                    alert('Ticket marked as issued! You can now notify the employee.');
                }
            } catch (error) {
                console.error('Error marking ticket as issued:', error);
            }
        }
    };

    const handleDownloadPDF = () => {
        alert("PDF Download functionality would be implemented here generating a document with the ticket details.");
    };

    const handlePrintTicket = () => {
        window.print();
    };

    const handleNotifyTicketIssued = (ticket: TicketRequest) => {
        const status = ticket.status;
        const isSettled = status === 'SETTLED';
        const isSettlementReady = status === 'SETTLEMENT_READY';
        const isIssued = status === 'TICKET_ISSUED';

        let subjectStatus = 'UPDATE';
        if (isSettled) subjectStatus = 'SETTLEMENT COMPLETED';
        else if (isSettlementReady) subjectStatus = 'SETTLEMENT READY';
        else if (isIssued) subjectStatus = 'TICKET ISSUED';

        const subject = `${ticket.leaveRequest.user.staffCode} | ${ticket.route} | ${ticket.leaveRequest.user.name.toUpperCase()} | ${subjectStatus}`;

        const selectedQuoteInfo = ticket.selectedQuote ? JSON.parse(ticket.selectedQuote) : null;

        // Dynamic opening message
        let openingMessage = `Your leave and ticket request status has been updated.`;
        if (isIssued) openingMessage = `Your air ticket has been issued successfully.`;
        if (isSettlementReady) openingMessage = `Your ticket has been issued and your settlement is now READY for collection.`;
        if (isSettled) openingMessage = `Your settlement has been COMPLETED.`;

        const body = `Dear ${ticket.leaveRequest.user.name},%0D%0A%0D%0A` +
            `${openingMessage}%0D%0A%0D%0A` +
            `CURRENT STATUS SUMMARY%0D%0A` +
            `----------------------------------------%0D%0A` +
            `Leave Request: ${ticket.leaveRequest.status} (Approved)%0D%0A` +
            `Ticket Status: ${status.replace('_', ' ')}%0D%0A` +
            `Settlement: ${isSettled ? 'Paid/Settled' : (isSettlementReady ? 'Ready for Collection' : 'In Process')}%0D%0A%0D%0A` +
            `LEAVE DETAILS%0D%0A` +
            `----------------------------------------%0D%0A` +
            `Type: ${ticket.leaveRequest.type}%0D%0A` +
            `Dates: ${new Date(ticket.leaveRequest.startDate).toLocaleDateString()} - ${new Date(ticket.leaveRequest.endDate).toLocaleDateString()} (${ticket.leaveRequest.days} days)%0D%0A%0D%0A` +
            `FLIGHT DETAILS%0D%0A` +
            `----------------------------------------%0D%0A` +
            `Route: ${ticket.route}%0D%0A` +
            (selectedQuoteInfo ?
                `Airline: ${selectedQuoteInfo.airline}%0D%0A` +
                `Flight Type: ${selectedQuoteInfo.type}%0D%0A` +
                `Departure: ${selectedQuoteInfo.departure}%0D%0A` +
                `Baggage: ${selectedQuoteInfo.baggage}%0D%0A` +
                `Refundable: ${selectedQuoteInfo.refundable ? 'Yes' : 'No'}%0D%0A%0D%0A`
                : 'Ticket details pending%0D%0A%0D%0A') +
            `NEXT STEPS%0D%0A` +
            `----------------------------------------%0D%0A` +
            (isSettlementReady ? `Please visit the Accounts/HR department to collect your settlement/ticket.` :
                isIssued ? `Your ticket is ready. We are currently processing your settlement.` :
                    `Please contact HR for further details.`) +
            `%0D%0A%0D%0A` +
            `Best regards,%0D%0AHR Department`;

        const mailtoLink = `mailto:${ticket.leaveRequest.user.email}?subject=${encodeURIComponent(subject)}&body=${body}`;
        window.open(mailtoLink, '_blank');
    };

    const handleNotifyAccounts = (ticket: TicketRequest) => {
        const selectedQuoteInfo = ticket.selectedQuote ? JSON.parse(ticket.selectedQuote) : null;

        const subject = `${ticket.leaveRequest.user.staffCode} | ${ticket.route} | ${ticket.leaveRequest.user.name.toUpperCase()} | SETTLEMENT REQUEST`;

        const body = `Dear Accounts Department,%0D%0A%0D%0A` +
            `Please prepare the settlement for the following employee who is proceeding on leave.%0D%0A%0D%0A` +
            `EMPLOYEE DETAILS%0D%0A` +
            `Name: ${ticket.leaveRequest.user.name}%0D%0A` +
            `Staff Code: ${ticket.leaveRequest.user.staffCode}%0D%0A` +
            `Department: ${ticket.leaveRequest.user.department}%0D%0A` +
            `Location: ${ticket.leaveRequest.user.location}%0D%0A` +
            `Ticket Eligibility: ${ticket.leaveRequest.user.ticketEligible ? 'Eligible (Company Sponsored)' : 'Not Eligible (Personal Expense)'}%0D%0A%0D%0A` +
            `LEAVE DETAILS%0D%0A` +
            `Leave Type: ${ticket.leaveRequest.type}%0D%0A` +
            `Leave Period: ${new Date(ticket.leaveRequest.startDate).toLocaleDateString()} - ${new Date(ticket.leaveRequest.endDate).toLocaleDateString()} (${ticket.leaveRequest.days} days)%0D%0A` +
            `Leave Status: ${ticket.leaveRequest.status}%0D%0A%0D%0A` +
            `TRAVEL DETAILS%0D%0A` +
            `Route: ${ticket.route}%0D%0A` +
            (selectedQuoteInfo ?
                `Airline: ${selectedQuoteInfo.airline}%0D%0A` +
                `Ticket Price: OMR ${selectedQuoteInfo.price.toFixed(3)}%0D%0A` +
                `Flight Type: ${selectedQuoteInfo.type}%0D%0A%0D%0A`
                : 'Ticket details pending%0D%0A%0D%0A') +
            `SETTLEMENT COMPONENTS TO CALCULATE:%0D%0A` +
            `- Leave Salary%0D%0A` +
            `- Air Ticket Cost${ticket.leaveRequest.user.ticketEligible ? ' (Company Sponsored)' : ' (Employee Deduction)'}%0D%0A` +
            `- Applicable Incentives/Allowances%0D%0A` +
            `- Other Entitlements%0D%0A%0D%0A` +
            `Please calculate the total settlement amount and update the status to "SETTLEMENT READY" once prepared.%0D%0A%0D%0A` +
            `Best regards,%0D%0AHR Department`;

        const mailtoLink = `mailto:accounts@al-obaidani.com?subject=${encodeURIComponent(subject)}&body=${body}`;
        window.open(mailtoLink, '_blank');
    };

    const handleUpdateSettlementStatus = async (ticket: TicketRequest, newStatus: string) => {
        if (confirm(`Are you sure you want to update status to ${newStatus.replace('_', ' ')}?`)) {
            try {
                const response = await fetch(`/api/admin/tickets/${ticket.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: newStatus
                    })
                });

                if (response.ok) {
                    const updatedTicket = await response.json();
                    setTickets(tickets.map(t => t.id === ticket.id ? updatedTicket : t));
                }
            } catch (error) {
                console.error('Error updating settlement status:', error);
            }
        }
    };

    const getApprovalStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string, color: string, label: string }> = {
            'PENDING': { bg: '#fef3c7', color: '#d97706', label: 'Pending Approval' },
            'APPROVED': { bg: '#dcfce7', color: '#16a34a', label: 'Approved' },
            'REJECTED': { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
        };
        const style = styles[status] || { bg: '#f1f5f9', color: '#64748b', label: status };
        return (
            <span style={{
                backgroundColor: style.bg,
                color: style.color,
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 600
            }}>
                {style.label}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading || status === "loading") {
        return <div>Loading...</div>;
    }

    // Filter Logic
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = (
            ticket.leaveRequest.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.leaveRequest.user.staffCode.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const matchesStatus = statusFilter ? ticket.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            <header className="dashboard-header">
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>Ticket Center</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage flight ticket requests and quotes.</p>
                </div>
            </header>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Search</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Employee Name or Staff Code"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Status</label>
                        <select
                            className="form-input"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING_QUOTE">Pending Quote</option>
                            <option value="QUOTE_RECEIVED">Quote Received</option>
                            <option value="TICKET_ISSUED">Ticket Issued</option>
                            <option value="SETTLEMENT_READY">Settlement Ready</option>
                            <option value="SETTLED">Settled</option>
                        </select>
                    </div>
                </div>
            </div>

            {filteredTickets.length === 0 ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No ticket requests found matching your filters.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {filteredTickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="card"
                            style={{
                                borderLeft: `4px solid ${ticket.status === 'TICKET_ISSUED' ? '#16a34a' : '#3b82f6'}`,
                                cursor: 'pointer'
                            }}
                            onClick={() => setViewingTicket(ticket)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
                                        {ticket.leaveRequest.user.name}
                                    </h3>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                        {ticket.leaveRequest.user.staffCode} • {ticket.leaveRequest.user.email}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                                    <span style={{
                                        backgroundColor: ticket.status === 'TICKET_ISSUED' ? '#dcfce7' : '#dbeafe',
                                        color: ticket.status === 'TICKET_ISSUED' ? '#166534' : '#1e40af',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem'
                                    }}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                    {getApprovalStatusBadge(ticket.leaveRequest.status)}
                                </div>
                            </div>

                            <div className="grid-3" style={{ marginBottom: '1.5rem', fontSize: '0.8125rem' }}>
                                <div>
                                    <p style={{ color: 'var(--text-light)', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.025em' }}>Location</p>
                                    <p style={{ fontWeight: 500 }}>{ticket.leaveRequest.user.department}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{ticket.leaveRequest.user.location}</p>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-light)', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.025em' }}>Route</p>
                                    <p style={{ fontWeight: 500 }}>{ticket.route}</p>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-light)', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.025em' }}>Travel Dates</p>
                                    <p style={{ fontWeight: 500 }}>{formatDate(ticket.leaveRequest.startDate)} - {formatDate(ticket.leaveRequest.endDate)}</p>
                                </div>
                            </div>

                            {ticket.quotes && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Saved Quotes:</p>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {JSON.parse(ticket.quotes).map((quote: Quote, idx: number) => {
                                            const selectedQuote = ticket.selectedQuote ? JSON.parse(ticket.selectedQuote) : null;
                                            const isIssued = selectedQuote &&
                                                selectedQuote.airline === quote.airline &&
                                                selectedQuote.price === quote.price &&
                                                selectedQuote.departure === quote.departure;

                                            return (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        padding: '1rem',
                                                        backgroundColor: isIssued ? '#f0fdf4' : '#ffffff',
                                                        border: isIssued ? '2px solid #16a34a' : '1px solid var(--border)',
                                                        borderRadius: 'var(--radius-md)',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        gap: '1rem'
                                                    }}
                                                >
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                            <span style={{
                                                                backgroundColor: isIssued ? '#16a34a' : '#dbeafe',
                                                                color: isIssued ? '#ffffff' : '#1e40af',
                                                                padding: '0.25rem 0.5rem',
                                                                borderRadius: '0.25rem',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 700
                                                            }}>
                                                                {isIssued ? '✓ ISSUED' : `Option ${idx + 1}`}
                                                            </span>
                                                            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{quote.airline}</span>
                                                            <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary)' }}>OMR {quote.price.toFixed(3)}</span>
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            <div>
                                                                <span style={{ fontWeight: 600 }}>Type:</span> {quote.type}
                                                            </div>
                                                            <div>
                                                                <span style={{ fontWeight: 600 }}>Timing:</span> {quote.departure}
                                                            </div>
                                                            <div>
                                                                <span style={{ fontWeight: 600 }}>Baggage:</span> {quote.baggage}
                                                            </div>
                                                            <div>
                                                                <span style={{ fontWeight: 600 }}>Refundable:</span> {quote.refundable ? 'Yes' : 'No'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {ticket.status !== 'TICKET_ISSUED' && ticket.status !== 'SETTLEMENT_READY' && ticket.status !== 'SETTLED' && userRole !== 'ACCOUNTS' && (
                                                        <button
                                                            className="btn btn-accent"
                                                            style={{
                                                                fontSize: '0.8125rem',
                                                                padding: '0.5rem 1rem',
                                                                backgroundColor: '#2563eb',
                                                                color: 'white',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleIssueTicket(ticket, quote);
                                                            }}
                                                        >
                                                            ✈️ Issue This Quote
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                                {(() => {
                                    const isFinalized = ['TICKET_ISSUED', 'SETTLEMENT_READY', 'SETTLED'].includes(ticket.status);
                                    const isAccounts = userRole === 'ACCOUNTS';

                                    return (
                                        <>
                                            {/* Pre-Issuance Actions (HR/Admin Only) */}
                                            {!isFinalized && !isAccounts && (
                                                <>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                                                        onClick={() => handleRequestQuote(ticket)}
                                                    >
                                                        📧 Request Quote
                                                    </button>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                                                        onClick={() => handleOpenPriceEntry(ticket)}
                                                    >
                                                        💰 Enter Prices
                                                    </button>
                                                    {ticket.selectedQuote && (
                                                        <button
                                                            className="btn btn-accent"
                                                            style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', backgroundColor: '#16a34a', color: 'white' }}
                                                            onClick={() => handleMarkAsIssued(ticket)}
                                                        >
                                                            ✓ Mark as Issued
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            {/* Post-Issuance Actions */}
                                            {isFinalized && (
                                                <>
                                                    {!isAccounts && (
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                                                            onClick={() => handleNotifyTicketIssued(ticket)}
                                                        >
                                                            📧 Notify Employee
                                                        </button>
                                                    )}
                                                    {ticket.status !== 'SETTLED' && (
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', borderColor: '#f59e0b', color: '#f59e0b' }}
                                                            onClick={() => handleNotifyAccounts(ticket)}
                                                        >
                                                            💰 Notify Accounts
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            {/* Settlement Actions (Admin/HR/Accounts) */}
                                            {(userRole === 'ACCOUNTS' || userRole === 'ADMIN' || userRole === 'HR') && (
                                                <>
                                                    {ticket.status === 'TICKET_ISSUED' && (
                                                        <button
                                                            className="btn btn-primary"
                                                            style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
                                                            onClick={() => handleUpdateSettlementStatus(ticket, 'SETTLEMENT_READY')}
                                                        >
                                                            ✓ Mark Settlement Ready
                                                        </button>
                                                    )}
                                                    {ticket.status === 'SETTLEMENT_READY' && (
                                                        <button
                                                            className="btn btn-primary"
                                                            style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', backgroundColor: '#059669', borderColor: '#059669' }}
                                                            onClick={() => handleUpdateSettlementStatus(ticket, 'SETTLED')}
                                                        >
                                                            ✓ Mark as Settled
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Ticket Details View Modal */}
            {viewingTicket && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: 'var(--radius-lg)',
                        maxWidth: '900px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        padding: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                                Ticket Request Details
                            </h3>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button
                                    onClick={handleDownloadPDF}
                                    style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                                    title="Download PDF"
                                >
                                    📄
                                </button>
                                <button
                                    onClick={handlePrintTicket}
                                    style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}
                                    title="Print"
                                >
                                    🖨️
                                </button>
                                <button
                                    onClick={() => setViewingTicket(null)}
                                    style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {/* Employee Information */}
                            <section>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                    Employee Information
                                </h4>
                                <div className="grid-3" style={{ fontSize: '0.875rem' }}>
                                    <div>
                                        <p style={{ color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.25rem' }}>Staff Code</p>
                                        <p style={{ fontWeight: 600, color: 'var(--primary)' }}>{viewingTicket.leaveRequest.user.staffCode}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.25rem' }}>Name</p>
                                        <p>{viewingTicket.leaveRequest.user.name}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.25rem' }}>Email</p>
                                        <p>{viewingTicket.leaveRequest.user.email}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.25rem' }}>Department</p>
                                        <p>{viewingTicket.leaveRequest.user.department}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.25rem' }}>Location</p>
                                        <p>{viewingTicket.leaveRequest.user.location}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.25rem' }}>Ticket Eligibility</p>
                                        <p style={{ color: viewingTicket.leaveRequest.user.ticketEligible ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                                            {viewingTicket.leaveRequest.user.ticketEligible ? '✓ Eligible' : '✗ Not Eligible'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Leave Details */}
                            <section>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                    Leave Details
                                </h4>
                                <div className="grid-3" style={{ fontSize: '0.875rem' }}>
                                    <div>
                                        <p style={{ color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.25rem' }}>Leave Type</p>
                                        <p>{viewingTicket.leaveRequest.type}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.25rem' }}>Duration</p>
                                        <p>{viewingTicket.leaveRequest.days} Days</p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.25rem' }}>Approval Status</p>
                                        <div>{getApprovalStatusBadge(viewingTicket.leaveRequest.status)}</div>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.25rem' }}>Travel Dates</p>
                                        <p>{formatDate(viewingTicket.leaveRequest.startDate)} - {formatDate(viewingTicket.leaveRequest.endDate)}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.25rem' }}>Route</p>
                                        <p style={{ fontWeight: 600 }}>{viewingTicket.route}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.25rem' }}>Ticket Status</p>
                                        <p style={{
                                            color: viewingTicket.status === 'TICKET_ISSUED' ? '#166534' : '#1e40af',
                                            fontWeight: 600
                                        }}>{viewingTicket.status.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                {viewingTicket.leaveRequest.reason && (
                                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                                        <p style={{ color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Reason / Contact Info</p>
                                        <p style={{ fontSize: '0.875rem' }}>{viewingTicket.leaveRequest.reason}</p>
                                    </div>
                                )}
                            </section>

                            {/* Flight Quotes */}
                            {viewingTicket.quotes && (
                                <section>
                                    <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                        Flight Quotes
                                    </h4>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {JSON.parse(viewingTicket.quotes).map((quote: Quote, idx: number) => {
                                            const selectedQuote = viewingTicket.selectedQuote ? JSON.parse(viewingTicket.selectedQuote) : null;
                                            const isIssued = selectedQuote &&
                                                selectedQuote.airline === quote.airline &&
                                                selectedQuote.price === quote.price &&
                                                selectedQuote.departure === quote.departure;

                                            return (
                                                <div key={idx} style={{
                                                    padding: '1rem',
                                                    backgroundColor: isIssued ? '#f0fdf4' : '#f8fafc',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: isIssued ? '2px solid #16a34a' : '1px solid var(--border)'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            {isIssued && (
                                                                <span style={{
                                                                    backgroundColor: '#16a34a',
                                                                    color: '#ffffff',
                                                                    padding: '0.25rem 0.5rem',
                                                                    borderRadius: '0.25rem',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 700
                                                                }}>
                                                                    ✓ ISSUED
                                                                </span>
                                                            )}
                                                            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{quote.airline}</span>
                                                        </div>
                                                        <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary)' }}>OMR {quote.price.toFixed(3)}</span>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
                                                        <div>
                                                            <p style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Type</p>
                                                            <p style={{ fontWeight: 500 }}>{quote.type}</p>
                                                        </div>
                                                        <div>
                                                            <p style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Timing</p>
                                                            <p style={{ fontWeight: 500 }}>{quote.departure}</p>
                                                        </div>
                                                        <div>
                                                            <p style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Baggage</p>
                                                            <p style={{ fontWeight: 500 }}>{quote.baggage}</p>
                                                        </div>
                                                        <div>
                                                            <p style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Refundable</p>
                                                            <p style={{ fontWeight: 600, color: quote.refundable ? '#16a34a' : '#d97706' }}>
                                                                {quote.refundable ? 'Yes' : 'No'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}
                        </div>

                        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setViewingTicket(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Price Entry Modal */}
            {editingTicket && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: 'var(--radius-lg)',
                        maxWidth: '800px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        padding: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                                Enter Flight Quotes
                            </h3>
                            <button
                                onClick={() => setEditingTicket(null)}
                                style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                                ×
                            </button>
                        </div>

                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            For: <strong>{editingTicket.leaveRequest.user.name}</strong> • {editingTicket.route}
                        </p>

                        {quotes.map((quote, index) => (
                            <div key={index} style={{ marginBottom: '1.5rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h5 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                        Quote {index + 1}
                                    </h5>
                                    {quotes.length > 1 && (
                                        <button
                                            onClick={() => removeQuote(index)}
                                            style={{ fontSize: '0.875rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Airline *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Oman Air"
                                            value={quote.airline}
                                            onChange={(e) => updateQuote(index, 'airline', e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Price (OMR) *</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            className="form-input"
                                            placeholder="245.000"
                                            value={quote.price || ''}
                                            onChange={(e) => updateQuote(index, 'price', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Type</label>
                                        <select
                                            className="form-input"
                                            value={quote.type}
                                            onChange={(e) => updateQuote(index, 'type', e.target.value)}
                                        >
                                            <option>Direct</option>
                                            <option>1 Stop</option>
                                            <option>2 Stops</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Timing *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="08:00 → 14:30"
                                            value={quote.departure}
                                            onChange={(e) => updateQuote(index, 'departure', e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Baggage</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={quote.baggage}
                                            onChange={(e) => updateQuote(index, 'baggage', e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Refundable</label>
                                        <select
                                            className="form-input"
                                            value={quote.refundable.toString()}
                                            onChange={(e) => updateQuote(index, 'refundable', e.target.value === 'true')}
                                        >
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {quotes.length < 3 && (
                            <button
                                className="btn btn-outline"
                                onClick={addQuote}
                                style={{ width: '100%', marginBottom: '1rem' }}
                            >
                                + Add Another Quote
                            </button>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-outline" onClick={() => setEditingTicket(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSaveQuotes}>
                                Save Quotes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Issue Ticket Confirmation Modal */}
            {issuingQuote && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: 'var(--radius-lg)',
                        maxWidth: '500px',
                        width: '100%',
                        padding: '2rem',
                        textAlign: 'center',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <div style={{ marginBottom: '1.5rem', fontSize: '3rem' }}>✈️</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
                            Confirm Ticket Issuance
                        </h3>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                            The email client has been opened. Have you sent the issuance request to the travel agent?
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => setIssuingQuote(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                                onClick={confirmIssueTicket}
                            >
                                Yes, Mark as Issued
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
