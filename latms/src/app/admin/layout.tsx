import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // @ts-ignore
    if (session.user.role !== 'ADMIN' && session.user.role !== 'HR' && session.user.role !== 'ACCOUNTS') {
        redirect("/dashboard");
    }

    // @ts-ignore
    const userName = session.user.name || "Admin";
    // @ts-ignore
    const userDepartment = session.user.department || "Administration";
    // @ts-ignore
    const userRole = session.user.role;

    // Get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="dashboard-container">
            {/* Admin Sidebar */}
            <aside className="sidebar" style={{ backgroundColor: '#0f172a' }}>
                <div className="sidebar-header">
                    <h1 className="sidebar-brand">
                        LATMS <span style={{ color: '#f59e0b' }}>ADMIN</span>
                    </h1>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Management Portal</p>
                </div>

                <nav className="sidebar-nav">
                    {userRole !== 'ACCOUNTS' && (
                        <>
                            <div className="sidebar-section-label">
                                Overview
                            </div>
                            <Link href="/admin/dashboard" className="sidebar-link">
                                📈 Analytics
                            </Link>
                        </>
                    )}

                    <div className="sidebar-section-label" style={{ marginTop: '2rem' }}>
                        Workflows
                    </div>
                    {userRole !== 'ACCOUNTS' && (
                        <Link href="/admin/approvals" className="sidebar-link" style={{ justifyContent: 'space-between' }}>
                            <span>✅ Approvals</span>
                            <span style={{ backgroundColor: '#2563eb', color: 'white', fontSize: '0.65rem', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>3</span>
                        </Link>
                    )}
                    <Link href="/admin/tickets" className="sidebar-link" style={{ justifyContent: 'space-between' }}>
                        <span>✈️ Ticket Center</span>
                        <span style={{ backgroundColor: '#d97706', color: 'white', fontSize: '0.65rem', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>1</span>
                    </Link>

                    {userRole === 'ADMIN' && (
                        <>
                            <div className="sidebar-section-label" style={{ marginTop: '2rem' }}>
                                System
                            </div>
                            <Link href="/admin/employees" className="sidebar-link">
                                👥 Employees
                            </Link>
                        </>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="avatar" style={{ backgroundColor: '#d97706' }}>
                            {getInitials(userName)}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{userName}</p>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{userDepartment}</p>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
