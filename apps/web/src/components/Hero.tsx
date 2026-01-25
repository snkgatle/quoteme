import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';

const Hero: React.FC = () => {
    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-12">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-primary-50 rounded-full blur-3xl opacity-50 z-0" />
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-orange-100/30 rounded-full blur-3xl opacity-50 z-0" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary-100/50 border border-primary-200 text-primary-700 text-sm font-bold tracking-tight">
                        <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                        Next-Gen AI Home Solutions
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 leading-[0.9] tracking-tighter">
                        Your Entire Project. <br />
                        <span className="text-primary-500">One Single Quote.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-xl leading-relaxed font-medium">
                        Stop chasing individual contractors. Our AI deconstructs your vision and coordinates top-tier professionals into a unified, transparent bid.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Link
                            to="/request-quote"
                            className="group w-full sm:w-auto px-8 py-5 bg-gray-900 text-white rounded-2xl text-lg font-bold shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:bg-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                        >
                            Start Your Project
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <button className="flex items-center gap-4 text-gray-900 font-bold hover:text-primary-600 transition-colors group">
                            <span className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-primary-500 transition-colors">
                                <Play className="w-4 h-4 fill-current ml-1" />
                            </span>
                            See How It Works
                        </button>
                    </div>

                    <div className="mt-12 flex items-center gap-8 border-t border-gray-100 pt-8">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-500 flex items-center justify-center text-[10px] font-bold text-white">
                                +2k
                            </div>
                        </div>
                        <div className="text-sm font-bold text-gray-500">
                            Trusted by <span className="text-gray-900 font-black">2,000+</span> Homeowners
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative hidden lg:block"
                >
                    {/* Main Image Card */}
                    <div className="relative z-10 rounded-[48px] overflow-hidden shadow-[0_48px_96px_-24px_rgba(0,0,0,0.15)] border-8 border-white bg-gray-100 aspect-[4/5]">
                        <img
                            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                            alt="Modern Home"
                            className="w-full h-full object-cover"
                        />
                        {/* AI Overlay Badge */}
                        <div className="absolute top-8 left-8 p-6 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl max-w-[240px]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <p className="font-black text-gray-900 text-sm leading-tight">AI Deconstruction Complete</p>
                            </div>
                            <div className="space-y-2">
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full w-[85%] bg-primary-500 rounded-full" />
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                                    <span>4 Trades Matched</span>
                                    <span>R12,400 Total</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decor Blocks */}
                    <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary-500 rounded-[40px] -z-10 shadow-2xl" />
                    <div className="absolute -top-6 -left-6 w-32 h-32 border-4 border-primary-200 rounded-[24px] -z-10" />
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
