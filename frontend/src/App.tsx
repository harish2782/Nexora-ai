import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import ResumePage from '@/pages/ResumePage'
import RolesPage from '@/pages/RolesPage'
import AnalysisPage from '@/pages/AnalysisPage'
import SkillGraphPage from '@/pages/SkillGraphPage'
import RoadmapPage from '@/pages/RoadmapPage'
import ProjectsPage from '@/pages/ProjectsPage'
import SettingsPage from '@/pages/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth()
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
                path="/dashboard"
                element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>}
            />
            <Route
                path="/resume"
                element={<ProtectedRoute><Layout><ResumePage /></Layout></ProtectedRoute>}
            />
            <Route
                path="/roles"
                element={<ProtectedRoute><Layout><RolesPage /></Layout></ProtectedRoute>}
            />
            <Route
                path="/analysis/:id"
                element={<ProtectedRoute><Layout><AnalysisPage /></Layout></ProtectedRoute>}
            />
            <Route
                path="/graph"
                element={<ProtectedRoute><Layout><SkillGraphPage /></Layout></ProtectedRoute>}
            />
            <Route
                path="/roadmap/:analysisId"
                element={<ProtectedRoute><Layout><RoadmapPage /></Layout></ProtectedRoute>}
            />
            <Route
                path="/projects"
                element={<ProtectedRoute><Layout><ProjectsPage /></Layout></ProtectedRoute>}
            />
            <Route
                path="/settings"
                element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    )
}
