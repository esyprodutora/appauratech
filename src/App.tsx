import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Workspaces from "./pages/Workspaces";
import CreateWorkspace from "./pages/CreateWorkspace";
import WorkspaceDetail from "./pages/WorkspaceDetail";
import InstallScript from "./pages/InstallScript";
import Plans from "./pages/Plans";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/workspaces" element={<Workspaces />} />
        <Route path="/workspaces/new" element={<CreateWorkspace />} />
        <Route path="/workspaces/:id" element={<WorkspaceDetail />} />
        <Route path="/install" element={<InstallScript />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
