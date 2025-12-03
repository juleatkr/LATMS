"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Employee {
    id: string;
    name: string;
    staffCode: string;
    department: string;
    annualLeaveBal: number;
}

export default function PostLeaveForTeamPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [ticketRequired, setTicketRequired] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        leaveType: "Annual Leave",
        reason: "",
        startDate: "",
        endDate: "",
        destinationCountry: "",
        emergencyPhone: "",
        ticketType: "Company Sponsored (Annual/Biennial)",
        dependentTickets: "No, Self Only",
        route: "",
        internalRemarks: ""
    });

    useEffect(() => {
        // Fetch employees
        const fetchEmployees = async () => {
            try {
                const res = await fetch('/api/users/employees');
                const data = await res.json();
                if (data.success) {
                    setEmployees(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch employees", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const selectedEmp = employees.find(emp => emp.id === selectedEmployee);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateDays = () => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays > 0 ? diffDays : 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!selectedEmployee) {
            setError("Please select an employee");
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                employeeId: selectedEmployee,
                leaveType: formData.leaveType,
                reason: formData.reason,
                startDate: formData.startDate,
                endDate: formData.endDate,
                days: calculateDays(),
                ticketRequired: ticketRequired,
                ticketType: formData.ticketType,
                dependentTickets: formData.dependentTickets,
                route: formData.route,
                supervisorNotes: formData.internalRemarks,
                contactDestination: formData.destinationCountry,
                contactPhone: formData.emergencyPhone
            };

            const res = await fetch('/api/leave-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                router.push('/dashboard/requests');
            } else {
                setError(data.error + (data.details ? ": " + data.details : "") || "Failed to submit request");
            }
        } catch (error) {
            console.error("Error submitting request:", error);
            setError("An error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading team members...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {error && (
                <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}
            <header style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                    Post Leave for Team Member
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    As a supervisor, you can submit leave applications on behalf of your team members.
                </p>
            </header>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Section 0: Employee Selection */}
                <section className="card" style={{
                    background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)',
                    border: '1px solid #bfdbfe',
                    padding: '1.25rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>👥</span>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e40af' }}>Select Employee</h3>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-main)' }}>
                            Choose Team Member
                        </label>
                        <select
                            className="form-input"
                            style={{ width: '100%' }}
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            required
                        >
                            <option value="">-- Select an employee --</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name} ({emp.staffCode})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedEmp && (
                        <div style={{
                            background: 'white',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid #bfdbfe',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '0.75rem'
                        }}>
                            <div>
                                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '600', color: 'var(--text-light)', marginBottom: '0.1rem' }}>
                                    Employee ID
                                </p>
                                <p style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>{selectedEmp.staffCode}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '600', color: 'var(--text-light)', marginBottom: '0.1rem' }}>
                                    Department
                                </p>
                                <p style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>{selectedEmp.department || 'N/A'}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '600', color: 'var(--text-light)', marginBottom: '0.1rem' }}>
                                    Leave Balance
                                </p>
                                <p style={{ fontWeight: '600', color: 'var(--success)', fontSize: '0.9rem' }}>{selectedEmp.annualLeaveBal} Days</p>
                            </div>
                        </div>
                    )}
                </section>

                {selectedEmployee ? (
                    <>
                        {/* Section 1: Leave Details */}
                        <section className="card">
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                1. Leave Details
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label className="form-label">Leave Type</label>
                                    <select
                                        className="form-input"
                                        name="leaveType"
                                        value={formData.leaveType}
                                        onChange={handleInputChange}
                                    >
                                        <option>Annual Leave</option>
                                        <option>Emergency Leave</option>
                                        <option>Sick Leave</option>
                                        <option>Unpaid Leave</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Reason for Leave</label>
                                    <input
                                        type="text"
                                        name="reason"
                                        placeholder="e.g. Family vacation, Medical"
                                        className="form-input"
                                        value={formData.reason}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label className="form-label">From Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">To Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: 'var(--radius-md)', color: '#1e40af', fontSize: '0.8rem' }}>
                                <strong>Note:</strong> You are posting <strong>{calculateDays()} days</strong> of leave for {selectedEmp?.name}. Current balance: {selectedEmp?.annualLeaveBal} days.
                            </div>
                        </section>

                        {/* Section 2: Contact Info */}
                        <section className="card">
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                2. Contact During Leave
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div>
                                    <label className="form-label">Destination Country</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. India, Oman"
                                        className="form-input"
                                        name="destinationCountry"
                                        value={formData.destinationCountry}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Emergency Phone</label>
                                    <input
                                        type="tel"
                                        placeholder="+968..."
                                        className="form-input"
                                        name="emergencyPhone"
                                        value={formData.emergencyPhone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Ticket Request */}
                        <section className="card">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                    3. Air Ticket Request
                                </h3>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
                                        checked={ticketRequired}
                                        onChange={(e) => setTicketRequired(e.target.checked)}
                                    />
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Ticket Required?</span>
                                </label>
                            </div>

                            {ticketRequired && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', color: '#92400e', fontSize: '0.8rem' }}>
                                        ⚠️ <strong>Passport Check:</strong> Ensure employee's passport is valid for at least 6 months from travel date.
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                        <div>
                                            <label className="form-label">Ticket Type</label>
                                            <select
                                                className="form-input"
                                                name="ticketType"
                                                value={formData.ticketType}
                                                onChange={handleInputChange}
                                            >
                                                <option>Company Sponsored (Annual/Biennial)</option>
                                                <option>Self-Paid</option>
                                                <option>Emergency Ticket</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label">Dependent Tickets</label>
                                            <select
                                                className="form-input"
                                                name="dependentTickets"
                                                value={formData.dependentTickets}
                                                onChange={handleInputChange}
                                            >
                                                <option>No, Self Only</option>
                                                <option>Spouse Only</option>
                                                <option>Spouse + 1 Child</option>
                                                <option>Spouse + 2 Children</option>
                                                <option>Spouse + 3+ Children</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="form-label">Preferred Route</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Muscat -> Mumbai -> Muscat"
                                            className="form-input"
                                            name="route"
                                            value={formData.route}
                                            onChange={handleInputChange}
                                            required={ticketRequired}
                                        />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Section 4: Internal Remarks */}
                        <section className="card">
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                4. Supervisor Remarks
                            </h3>
                            <div>
                                <label className="form-label">Internal Notes (Optional)</label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    placeholder="Any additional context for HR..."
                                    name="internalRemarks"
                                    value={formData.internalRemarks}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>
                        </section>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Leave Request'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                        <p>Please select an employee above to proceed with the leave application.</p>
                    </div>
                )}
            </form>
        </div>
    );
}
