import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server } from 'lucide-react';

const SPPrivacySettings: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
        >
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Privacy & Data Handling</h2>
                <p className="text-gray-500">Understanding how we manage and protect your data.</p>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Data Handling Policy</h3>
                            <p className="text-sm text-slate-600">
                                We are committed to protecting your personal information and ensuring transparency in how we handle your data.
                                This policy outlines our practices regarding data collection, usage, and protection.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 pl-4 border-l-2 border-gray-100 ml-6">
                        <div className="relative">
                            <span className="absolute -left-[25px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></span>
                            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Server className="w-4 h-4 text-gray-400" />
                                Data Collection
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                We collect information necessary to provide our services, including business details, contact information,
                                and location data. This information is used to match Service Providers with relevant project requests
                                and to verify qualifications.
                            </p>
                        </div>

                        <div className="relative">
                            <span className="absolute -left-[25px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></span>
                            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Eye className="w-4 h-4 text-gray-400" />
                                Data Usage & Sharing
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Your data is used to facilitate connections between you and potential customers. We do not sell your
                                personal data to third parties. Customer contact details are shared with you only upon acceptance of a quote
                                to protect user privacy. Similarly, your direct contact details are revealed to customers only when relevant.
                            </p>
                        </div>

                        <div className="relative">
                             <span className="absolute -left-[25px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></span>
                            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-gray-400" />
                                Security Measures
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                We employ industry-standard security measures to protect your data from unauthorized access, alteration,
                                or destruction. This includes encryption of sensitive data and regular security audits.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <h3 className="text-md font-bold text-gray-900 mb-2">Privacy Controls</h3>
                     <p className="text-sm text-slate-600 mb-4">
                        You can manage your public profile visibility and communication preferences in the <a href="#" className="text-primary-600 hover:underline">Settings</a> tab.
                        For data deletion requests, please contact our support team.
                     </p>
                </div>
            </div>
        </motion.div>
    );
};

export default SPPrivacySettings;
