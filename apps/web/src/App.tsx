import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SPOnboardingForm from './components/SPOnboardingForm'
import SPAdminDashboard from './components/SPAdminDashboard'
import ProjectIntakeForm from './components/ProjectIntakeForm'
import Header from './components/Header'
import Home from './pages/Home'
import Footer from './components/Footer'
import SPLogin from './pages/SPLogin'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-gray-50 flex flex-col">
                    <Header />
                    <main className="flex-1">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/request-quote" element={<div className="py-20 bg-gray-50"><ProjectIntakeForm /></div>} />
                            <Route path="/sp-login" element={<SPLogin />} />
                            <Route path="/onboard" element={<div className="py-20 bg-gray-50"><SPOnboardingForm /></div>} />
                            <Route path="/dashboard" element={
                                <ProtectedRoute>
                                    <SPAdminDashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin" element={
                                <ProtectedRoute>
                                    <SPAdminDashboard />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
