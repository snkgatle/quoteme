import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SPOnboardingForm from './components/SPOnboardingForm'
import SPAdminDashboard from './components/SPAdminDashboard'
import ProjectIntakeForm from './components/ProjectIntakeForm'
import Home from './pages/Home'
import SPLogin from './pages/SPLogin'
import QuoteReview from './pages/QuoteReview'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import MainLayout from './components/layout/MainLayout'
import HowItWorks from './pages/HowItWorks'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Contact from './pages/Contact'

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <BrowserRouter>
                    <MainLayout>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/request-quote" element={<div className="py-20 bg-gray-50"><ProjectIntakeForm /></div>} />
                            <Route path="/sp-login" element={<SPLogin />} />
                            <Route path="/projects/:id/review" element={<QuoteReview />} />
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
                            <Route path="/how-it-works" element={<HowItWorks />} />
                            <Route path="/privacy-policy" element={<Privacy />} />
                            <Route path="/terms-of-service" element={<Terms />} />
                            <Route path="/contact" element={<Contact />} />
                        </Routes>
                    </MainLayout>
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
    )
}

export default App
