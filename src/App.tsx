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
import LandingPage from "./pages/LandingPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workspaces" element={<Workspaces />} />
        <Route path="/workspaces/new" element={<CreateWorkspace />} />
        <Route path="/workspaces/:id" element={<WorkspaceDetail />} />
        <Route path="/install" element={<InstallScript />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/plano" element={<Plans />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos" element={<TermsOfService />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
