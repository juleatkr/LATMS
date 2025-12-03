"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeaveApplicationForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [ticketRequired, setTicketRequired] = useState(false);
    const [formData, setFormData] = useState({
        type: "Annual Leave",
        startDate: "",
        endDate: "",
        destination: "",
        phone: "",
        ticketType: "Company Sponsored (Annual/Biennial)",
        dependents: "No, Self Only",
        route: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Calculate days
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            const response = await fetch("/api/leave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: formData.type,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    days,
                    reason: `Destination: ${formData.destination}. Contact: ${formData.phone}`,
                    ticketRequired,
                    route: ticketRequired ? formData.route : null,
                }),
            });

            if (response.ok) {
                alert("Leave request submitted successfully!");
                router.push("/dashboard/requests");
            } else {
                alert("Failed to submit request. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const calculateDays = () => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }
        return 0;
    };

    return (
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>Apply for Leave</h2>
                <p style={{ color: 'var(--text-muted)' }}>Submit your leave request. If eligible, you can also request an air ticket.</p>
            </header>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Section 1: Leave Details */}
                <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>1. Leave Details</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Leave Type</label>
                            <select
                                className="form-input"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                            >
                                <option>Annual Leave</option>
                                <option>Emergency Leave</option>
                                <option>Sick Leave</option>
                                <option>Unpaid Leave</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">From Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">To Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: 'var(--radius-md)', color: '#1d4ed8', fontSize: '0.875rem' }}>
                        <strong>Note:</strong> You are requesting <strong>{calculateDays()} days</strong> of leave. Your current balance is 24 days.
                    </div>
                </section>

                {/* Section 2: Contact Info */}
                <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>2. Contact During Leave</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Destination Country</label>
                            <input
                                type="text"
                                placeholder="e.g. India, Oman"
                                className="form-input"
                                value={formData.destination}
                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Emergency Phone</label>
                            <input
                                type="tel"
                                placeholder="+968..."
                                className="form-input"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* Section 3: Ticket Request */}
                <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>3. Air Ticket Request</h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                style={{ width: '1.25rem', height: '1.25rem' }}
                                checked={ticketRequired}
                                onChange={(e) => setTicketRequired(e.target.checked)}
                            />
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>Ticket Required?</span>
                        </label>
                    </div>

                    {ticketRequired ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ padding: '1rem', backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: 'var(--radius-md)', color: '#854d0e', fontSize: '0.875rem' }}>
                                ⚠️ <strong>Passport Check:</strong> Please ensure your passport is valid for at least 6 months from the travel date.
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Ticket Type</label>
                                    <select
                                        className="form-input"
                                        value={formData.ticketType}
                                        onChange={(e) => setFormData({ ...formData, ticketType: e.target.value })}
                                    >
                                        <option>Company Sponsored (Annual/Biennial)</option>
                                        <option>Personal Expense (Deduction)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Dependent Tickets?</label>
                                    <select
                                        className="form-input"
                                        value={formData.dependents}
                                        onChange={(e) => setFormData({ ...formData, dependents: e.target.value })}
                                    >
                                        <option>No, Self Only</option>
                                        <option>Yes (Specify in Remarks)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Preferred Route / Remarks</label>
                                <textarea
                                    placeholder="e.g. Muscat -> Mumbai -> Muscat. Prefer morning flights."
                                    className="form-input"
                                    style={{ minHeight: '6rem' }}
                                    value={formData.route}
                                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                                ></textarea>
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                            Check the box above if you need the company to book air tickets for this leave.
                        </div>
                    )}
                </section>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem' }}>
                    <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ paddingLeft: '2rem', paddingRight: '2rem' }} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </div>
    );
}
