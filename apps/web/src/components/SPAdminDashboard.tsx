import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Briefcase, FileText, Settings, User, MapPin, EyeOff, Send } from 'lucide-react';

const SPAdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('requests');

    // Mock data for masked requests
    const maskedRequests = [
        {
            id: 'proj_123',
            description: 'Fix leaking sink and inspect kitchen plumbing.',
            trades: ['Plumber'],
            location: 'Johannesburg (Approx. 5km away)',
            status: 'OPEN',
            user: 'Anonymous Identity'
        },
        {
            id: 'proj_456',
            description: 'Rewire garage for EV charger installation.',
            trades: ['Electrician'],
            location: 'Pretoria (Approx. 12km away)',
            status: 'OPEN',
            user: 'Anonymous Identity'
        }
    ];

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
                        { id: 'requests', label: 'Job Requests', icon: Briefcase },
                        { id: 'quotes', label: 'My Quotes', icon: FileText },
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
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                            SP
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">Super Plumber Ltd</p>
                            <p className="text-xs text-gray-500 truncate">sp@example.com</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-y-auto">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Job Requests</h1>
                        <p className="text-gray-500">View and quote on nearby projects matched to your trades.</p>
                    </div>
                    <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-100 flex items-center gap-2 text-sm font-medium">
                        <EyeOff className="w-4 h-4" />
                        User Details Masked
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {maskedRequests.map((req) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">{req.trades.join(', ')}</span>
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
                                    {req.location}
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                    <User className="w-4 h-4 text-gray-400" />
                                    {req.user}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                                    <Send className="w-4 h-4" />
                                    Submit Quote
                                </button>
                                <button className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
                                    View Details
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default SPAdminDashboard;
