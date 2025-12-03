"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Employee {
    id: string;
    staffCode: string;
    email: string;
    name: string;
    role: string;
    department: string;
    location: string;
    annualLeaveBal: number;
    ticketEligible: boolean;
    supervisorId: string | null;
    supervisor?: {
        staffCode: string;
        name: string;
    } | null;
}

export default function EmployeesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [supervisors, setSupervisors] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({
        staffCode: "",
        name: "",
        email: "",
        role: "EMPLOYEE",
        department: "",
        location: "",
        annualLeaveBal: 30,
        ticketEligible: true,
        password: "",
        supervisorId: ""
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [deptFilter, setDeptFilter] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchEmployees();
        }
    }, [status, router]);

    const fetchEmployees = async () => {
        try {
            const response = await fetch("/api/admin/employees");
            if (response.ok) {
                const data = await response.json();
                setEmployees(data);
                // Filter potential supervisors
                const sups = data.filter((e: Employee) =>
                    e.role === 'SUPERVISOR' || e.role === 'MANAGER' || e.role === 'ADMIN'
                );
                setSupervisors(sups);
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setFormData({
            staffCode: employee.staffCode,
            name: employee.name,
            email: employee.email,
            role: employee.role,
            department: employee.department,
            location: employee.location,
            annualLeaveBal: employee.annualLeaveBal,
            ticketEligible: employee.ticketEligible,
            password: "",
            supervisorId: employee.supervisorId || ""
        });
        setIsEditing(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                const response = await fetch(`/api/admin/employees/${id}`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    setEmployees(employees.filter((emp) => emp.id !== id));
                } else {
                    alert("Failed to delete employee");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/admin/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Employee added successfully!");
                setIsAdding(false);
                setFormData({
                    staffCode: "",
                    name: "",
                    email: "",
                    role: "EMPLOYEE",
                    department: "",
                    location: "",
                    annualLeaveBal: 30,
                    ticketEligible: true,
                    password: "",
                    supervisorId: ""
                });
                fetchEmployees();
            } else {
                const error = await response.json();
                alert(error.error || "Failed to add employee");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEmployee) return;

        try {
            const response = await fetch(`/api/admin/employees/${editingEmployee.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Employee updated successfully!");
                setIsEditing(false);
                setEditingEmployee(null);
                fetchEmployees();
            } else {
                const errorData = await response.json().catch(() => null);
                alert(errorData?.error || "Failed to update employee");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred");
        }
    };

    if (loading || status === "loading") {
        return <div>Loading...</div>;
    }

    const filteredEmployees = employees.filter(employee => {
        const matchesSearch = (
            employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.staffCode.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const matchesRole = roleFilter ? employee.role === roleFilter : true;
        const matchesDept = deptFilter ? employee.department === deptFilter : true;
        return matchesSearch && matchesRole && matchesDept;
    });

    const departments = Array.from(new Set(employees.map(e => e.department))).filter(Boolean);

    return (
        <div>
            <header className="dashboard-header">
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>Employee Management</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage system users and their roles.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                    + Add Employee
                </button>
            </header>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Search</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Name, Email, or Staff Code"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Role</label>
                        <select
                            className="form-input"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="">All Roles</option>
                            <option value="EMPLOYEE">Employee</option>
                            <option value="SUPERVISOR">Supervisor</option>
                            <option value="MANAGER">Manager</option>
                            <option value="HR">HR</option>
                            <option value="MANAGEMENT">Management</option>
                            <option value="ACCOUNTS">Accounts</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Department</label>
                        <select
                            className="form-input"
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-light)', fontWeight: 600 }}>Staff Code</th>
                            <th style={{ padding: '1rem', color: 'var(--text-light)', fontWeight: 600 }}>Name</th>
                            <th style={{ padding: '1rem', color: 'var(--text-light)', fontWeight: 600 }}>Email</th>
                            <th style={{ padding: '1rem', color: 'var(--text-light)', fontWeight: 600 }}>Department</th>
                            <th style={{ padding: '1rem', color: 'var(--text-light)', fontWeight: 600 }}>Location</th>
                            <th style={{ padding: '1rem', color: 'var(--text-light)', fontWeight: 600 }}>Role</th>
                            <th style={{ padding: '1rem', color: 'var(--text-light)', fontWeight: 600 }}>Supervisor</th>
                            <th style={{ padding: '1rem', color: 'var(--text-light)', fontWeight: 600 }}>Leave Bal</th>
                            <th style={{ padding: '1rem', color: 'var(--text-light)', fontWeight: 600 }}>Eligible</th>
                            <th style={{ padding: '1rem', color: 'var(--text-light)', fontWeight: 600 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((emp) => (
                            <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{emp.staffCode}</td>
                                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>{emp.name}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{emp.email}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{emp.department}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{emp.location}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        backgroundColor: emp.role === 'ADMIN' ? '#dbeafe' : emp.role === 'SUPERVISOR' ? '#fef3c7' : '#f1f5f9',
                                        color: emp.role === 'ADMIN' ? '#1e40af' : emp.role === 'SUPERVISOR' ? '#92400e' : '#64748b',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>
                                        {emp.role}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    {emp.supervisor ? `${emp.supervisor.staffCode} - ${emp.supervisor.name}` : '-'}
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 600 }}>{emp.annualLeaveBal} days</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ color: emp.ticketEligible ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                                        {emp.ticketEligible ? '✓ Eligible' : '✗ Not Eligible'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button
                                        onClick={() => handleEdit(emp)}
                                        style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', marginRight: '1rem' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(emp.id, emp.name)}
                                        style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Employee Modal */}
            {isAdding && (
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
                                Add New Employee
                            </h3>
                            <button
                                onClick={() => setIsAdding(false)}
                                style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Staff Code *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="EC:6143"
                                        value={formData.staffCode}
                                        onChange={(e) => setFormData({ ...formData, staffCode: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="john@alobaidani.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password *</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Role *</label>
                                    <select
                                        className="form-input"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        required
                                    >
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="SUPERVISOR">Supervisor</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="HR">HR</option>
                                        <option value="MANAGEMENT">Management</option>
                                        <option value="ACCOUNTS">Accounts</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Department *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Sales, IT, Operations"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Location *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Branch, Factory, HO"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Supervisor (Optional)</label>
                                    <select
                                        className="form-input"
                                        value={formData.supervisorId}
                                        onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                                    >
                                        <option value="">No Supervisor</option>
                                        {supervisors.map(sup => (
                                            <option key={sup.id} value={sup.id}>
                                                {sup.staffCode} - {sup.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Annual Leave Balance</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.annualLeaveBal}
                                        onChange={(e) => setFormData({ ...formData, annualLeaveBal: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Ticket Eligible</label>
                                    <select
                                        className="form-input"
                                        value={formData.ticketEligible.toString()}
                                        onChange={(e) => setFormData({ ...formData, ticketEligible: e.target.value === 'true' })}
                                    >
                                        <option value="true">Yes (Eligible)</option>
                                        <option value="false">No (Not Eligible)</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setIsAdding(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Employee Modal */}
            {isEditing && (
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
                                Edit Employee
                            </h3>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditingEmployee(null);
                                }}
                                style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Staff Code *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="EC:6143"
                                        value={formData.staffCode}
                                        onChange={(e) => setFormData({ ...formData, staffCode: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="john@alobaidani.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password (leave blank to keep current)</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Role *</label>
                                    <select
                                        className="form-input"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        required
                                    >
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="SUPERVISOR">Supervisor</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="HR">HR</option>
                                        <option value="MANAGEMENT">Management</option>
                                        <option value="ACCOUNTS">Accounts</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Department *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Sales, IT, Operations"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Location *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Branch, Factory, HO"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Supervisor (Optional)</label>
                                    <select
                                        className="form-input"
                                        value={formData.supervisorId}
                                        onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                                    >
                                        <option value="">No Supervisor</option>
                                        {supervisors.filter(sup => sup.id !== editingEmployee?.id).map(sup => (
                                            <option key={sup.id} value={sup.id}>
                                                {sup.staffCode} - {sup.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Annual Leave Balance</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.annualLeaveBal}
                                        onChange={(e) => setFormData({ ...formData, annualLeaveBal: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Ticket Eligible</label>
                                    <select
                                        className="form-input"
                                        value={formData.ticketEligible.toString()}
                                        onChange={(e) => setFormData({ ...formData, ticketEligible: e.target.value === 'true' })}
                                    >
                                        <option value="true">Yes (Eligible)</option>
                                        <option value="false">No (Not Eligible)</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => {
                                    setIsEditing(false);
                                    setEditingEmployee(null);
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Update Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
