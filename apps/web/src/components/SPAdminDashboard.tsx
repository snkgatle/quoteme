import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Briefcase, FileText, Settings, User, MapPin, EyeOff, Send, LogOut, CheckCircle, XCircle, Clock, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Inbox from './Inbox';

interface Project {
    id: string;
    description: string;
    requiredTrades: string[];
    latitude?: number;
    longitude?: number;
    status: string;
    user?: {
        name: string;
        email: string;
        phone: string;
    };
}

interface Quote {
    id: string;
    amount: number;
    proposal: string;
    status: string;
    statusBadge: string;
    request: Project;
}

const SPAdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const { user, token, logout } = useAuth();
    const [newRequests, setNewRequests] = useState<Project[]>([]);
    const [sentQuotes, setSentQuotes] = useState<Quote[]>([]);
    const [acceptedJobs, setAcceptedJobs] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            setLoading(true);
            fetch('/api/sp/available-projects', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    setNewRequests(data.newRequests || []);
                    setSentQuotes(data.sentQuotes || []);
                    setAcceptedJobs(data.acceptedJobs || []);
                })
                .catch(err => console.error('Failed to fetch projects', err))
                .finally(() => setLoading(false));
        }
    }, [token]);

    const renderContent = () => {
        if (loading) return <div className="p-10 text-center">Loading...</div>;

        if (activeTab === 'requests') {
            return (
                <div className="grid grid-cols-1 gap-6">
                    {newRequests.length === 0 && <p className="text-gray-500">No new requests match your criteria.</p>}
                    {newRequests.map((req) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">{req.requiredTrades.join(', ')}</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-xs text-gray-500">{req.id}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 capitalize">{req.description}</h3>
                                </div>
                                <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{req.status}</span>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    {req.latitude && req.longitude ? 'Within 50km' : 'Unknown Location'}
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                    <User className="w-4 h-4 text-gray-400" />
                                    {req.user?.name || 'Anonymous User'}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                                    <Send className="w-4 h-4" />
                                    Submit Quote
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            );
        }

        if (activeTab === 'quotes') {
            return (
                <div className="grid grid-cols-1 gap-6">
                     {sentQuotes.length === 0 && <p className="text-gray-500">You haven't sent any quotes yet.</p>}
                    {sentQuotes.map((quote) => (
                         <motion.div
                            key={quote.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                             <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                         <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">{quote.request.requiredTrades.join(', ')}</span>
                                         <span className="text-gray-300">•</span>
                                         <span className="text-xs text-gray-500">{quote.id}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 capitalize">{quote.request.description}</h3>
                                </div>
                                {/* Status Badge */}
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${
                                    quote.statusBadge === 'Awarded' ? 'bg-green-50 text-green-700 border-green-100' :
                                    quote.statusBadge === 'Lost' ? 'bg-red-50 text-red-700 border-red-100' :
                                    'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                    {quote.statusBadge === 'Awarded' && <CheckCircle className="w-3 h-3" />}
                                    {quote.statusBadge === 'Lost' && <XCircle className="w-3 h-3" />}
                                    {quote.statusBadge === 'Pending' && <Clock className="w-3 h-3" />}
                                    {quote.statusBadge}
                                </div>
                            </div>
                             <div className="flex items-center gap-4 mb-2">
                                <div className="text-sm text-gray-600">
                                    You quoted: <span className="font-bold text-gray-900">${quote.amount}</span>
                                </div>
                            </div>
                             <div className="text-sm text-gray-500 mb-4 line-clamp-2">
                                 {quote.proposal}
                             </div>
                        </motion.div>
                    ))}
                </div>
            );
        }

        if (activeTab === 'accepted') {
             return (
                <div className="grid grid-cols-1 gap-6">
                    {acceptedJobs.length === 0 && <p className="text-gray-500">No accepted jobs yet.</p>}
                     {acceptedJobs.map((quote) => (
                         <motion.div
                            key={quote.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-shadow ring-1 ring-green-100"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-gray-900 capitalize">{quote.request.description}</h3>
                                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">Accepted</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Customer</p>
                                    <p className="text-sm font-semibold text-gray-900">{quote.request.user?.name}</p>
                                    <p className="text-xs text-gray-600">{quote.request.user?.email}</p>
                                    <p className="text-xs text-gray-600">{quote.request.user?.phone}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Location</p>
                                    <p className="text-sm font-semibold text-gray-900">{quote.request.latitude}, {quote.request.longitude}</p>
                                </div>
                            </div>
                             <button className="w-full bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors">
                                 Contact Customer
                             </button>
                         </motion.div>
                     ))}
                </div>
             );
        }

        if (activeTab === 'inbox') {
            return <Inbox token={token} />;
        }

        return null;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-10 px-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl text-gray-900">SP Admin</span>
                </div>

                <nav className="space-y-1 flex-1">
                    {[
                        { id: 'inbox', label: 'Inbox', icon: Bell },
                        { id: 'requests', label: 'New Requests', icon: Briefcase },
                        { id: 'quotes', label: 'My Quotes', icon: FileText },
                        { id: 'accepted', label: 'Accepted Jobs', icon: CheckCircle },
                        { id: 'profile', label: 'Profile', icon: User },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'SP'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Service Provider'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-y-auto">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {activeTab === 'inbox' && 'Inbox'}
                            {activeTab === 'requests' && 'Job Requests'}
                            {activeTab === 'quotes' && 'My Quotes'}
                            {activeTab === 'accepted' && 'Accepted Jobs'}
                        </h1>
                        <p className="text-gray-500">
                            {activeTab === 'inbox' && 'View your notifications and alerts.'}
                            {activeTab === 'requests' && 'View and quote on nearby projects matched to your trades.'}
                            {activeTab === 'quotes' && 'Track the status of your submitted quotes.'}
                            {activeTab === 'accepted' && 'Manage your ongoing and upcoming jobs.'}
                        </p>
                    </div>
                    {activeTab === 'requests' && (
                        <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-100 flex items-center gap-2 text-sm font-medium">
                            <EyeOff className="w-4 h-4" />
                            User Details Masked
                        </div>
                    )}
                </header>

                {renderContent()}
            </main>
        </div>
    );
};

export default SPAdminDashboard;
