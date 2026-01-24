import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Quote, Briefcase, LayoutDashboard } from 'lucide-react';

const Header: React.FC = () => {
    const location = useLocation();

    // Don't show header if in a full-screen dashboard (optional design choice)
    // For now, we'll keep it simple and show it everywhere or adjust as needed.

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="h-12 w-auto flex items-center justify-center group-hover:scale-105 transition-transform">
                        <img src="/assets/final01.png" alt="QuoteMe Logo" className="h-full w-auto object-contain" />
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    <Link
                        to="/onboard"
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/onboard')
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <Briefcase className="w-4 h-4" />
                        Join as Service Provider
                    </Link>

                    <Link
                        to="/admin"
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/admin')
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        SP Admin Portal
                    </Link>
                </nav>

                {/* Mobile Navigation (Simplified for MVP) */}
                <div className="md:hidden flex items-center gap-2">
                    <Link to="/onboard" className="p-2 text-gray-600"><Briefcase className="w-5 h-5" /></Link>
                    <Link to="/admin" className="p-2 text-gray-600"><LayoutDashboard className="w-5 h-5" /></Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
