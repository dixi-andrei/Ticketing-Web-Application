import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Import components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import UserDashboardPage from './pages/UserDashboardPage';
import ResaleMarketplacePage from './pages/ResaleMarketplacePage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Import CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App d-flex flex-column min-vh-100">
                    <Header />
                    <main className="flex-grow-1">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/events" element={<EventsPage />} />
                            <Route path="/events/:id" element={<EventDetailPage />} />
                            <Route path="/resale" element={<ResaleMarketplacePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/reset-password" element={<ResetPasswordPage />} />
                            <Route path="/verify-email" element={<EmailVerificationPage />} />

                            {/* Protected Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <UserDashboardPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Admin Routes */}
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute adminOnly={true}>
                                        <AdminDashboardPage />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;