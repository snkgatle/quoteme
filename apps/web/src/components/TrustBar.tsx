import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Star, Zap, Lock } from 'lucide-react';

const TrustBar: React.FC = () => {
    const signals = [
        { icon: ShieldCheck, label: "Verified Pros", sub: "Vetted & Licensed" },
        { icon: Star, label: "Top Rated", sub: "4.9/5 Avg Rating" },
        { icon: Zap, label: "AI Powered", sub: "Instant Trade Match" },
        { icon: Lock, label: "Secure Payments", sub: "Encrypted Transactions" },
    ];

    return (
        <section className="relative z-30 -mt-12 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-6xl mx-auto"
            >
                <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[32px] p-8 md:p-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        {signals.map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
                                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 shadow-sm border border-primary-100">
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 tracking-tight leading-none mb-1">{item.label}</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{item.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default TrustBar;
