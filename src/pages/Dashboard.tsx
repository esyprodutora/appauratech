import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-sidebar p-4">
        <h1 className="text-xl font-bold text-sidebar-foreground">AURA</h1>
        <nav className="mt-6 space-y-2">
          <a href="/" className="block rounded-md px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent">
            Dashboard
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="mt-2 text-muted-foreground">Bem-vindo, {user.email}</p>
      </main>
    </div>
  );
}
