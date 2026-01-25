import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import TrustBar from '../components/TrustBar';

const Home: React.FC = () => {
    return (
        <div className="flex flex-col bg-white">
            <Hero />
            <TrustBar />

            {/* Features / Benefits Section */}
            <section className="py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">The smarter way to build.</h2>
                        <p className="text-xl text-gray-500 font-medium">We've automated the heavy lifting of project management so you can focus on your vision.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "AI Analysis",
                                desc: "Our Gemini-powered engine breaks down your description into professional line items instantly.",
                                icon: "🧠"
                            },
                            {
                                title: "Verified Network",
                                desc: "Only licensed, background-checked pros can bid on your project. Quality is guaranteed.",
                                icon: "🏢"
                            },
                            {
                                title: "Transparent Pricing",
                                desc: "No more hidden fees or guesswork. See the real cost of labor and materials upfront.",
                                icon: "💎"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="p-10 rounded-[40px] bg-gray-50 border border-gray-100 hover:border-primary-200 transition-all group"
                            >
                                <div className="text-5xl mb-8 group-hover:scale-110 transition-transform origin-left">{feature.icon}</div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4">{feature.title}</h3>
                                <p className="text-gray-600 font-medium leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
