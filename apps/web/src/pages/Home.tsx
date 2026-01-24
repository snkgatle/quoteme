import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Star, Users } from 'lucide-react';

const Home: React.FC = () => {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/assets/images/hero_bg.png"
                        alt="Background"
                        className="w-full h-full object-cover opacity-60 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/40 to-gray-50/100" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary-100 text-primary-700 text-sm font-bold tracking-wide uppercase">
                            AI-Powered Home Services
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
                            Get a Single Quote for Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Entire Project.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Stop managing dozens of individual trades. Our AI deconstructs your vision and brings the experts to you in one unified quote.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/request-quote"
                                className="w-full sm:w-auto px-10 py-5 bg-gray-900 text-white rounded-2xl text-lg font-bold shadow-2xl hover:bg-black transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                            >
                                Start Your Project <ChevronRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/onboard"
                                className="w-full sm:w-auto px-10 py-5 bg-white text-gray-700 border border-gray-200 rounded-2xl text-lg font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            >
                                Join as a Provider
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Trust Bar (Floating) */}
            <section className="relative z-20 -mt-16 px-6">
                <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-wrap justify-center md:justify-between items-center gap-8">
                    <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="text-primary-600 w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">Verified Experts</p>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Background Checked</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                            <Star className="text-primary-600 w-6 h-6 fill-primary-600" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">4.9/5 Rating</p>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Customer Approved</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                            <Users className="text-primary-600 w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">Safe Payments</p>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Secure & Encrypted</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Process Section (Subtle) */}
            <section className="py-24 px-6 bg-gray-50">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight leading-snug">
                            How AI Simplifies Your <br /> Construction Journey
                        </h2>
                        <div className="space-y-8">
                            {[
                                { title: "Describe Your Vision", desc: "Simply tell us what you want to build or fix in plain English." },
                                { title: "AI Deconstruction", desc: "Gemini 1.5 Flash picks out every necessary trade from your text." },
                                { title: "Unified Quoting", desc: "We aggregate local bids into one single, transparent price." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0 font-bold">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{item.title}</p>
                                        <p className="text-gray-600">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100 rotate-2">
                        <img
                            src="/assets/images/trust_icons.png"
                            alt="AI Verification"
                            className="w-full rounded-2xl"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
