import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Cpu, FileCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
    {
        id: 1,
        title: "Describe Your Project",
        description: "Simply tell us what you need done. Whether it's 'Build a deck' or 'Renovate my kitchen', just describe your vision in plain English.",
        icon: MessageSquare,
        color: "bg-blue-100 text-blue-600"
    },
    {
        id: 2,
        title: "AI Deconstruction",
        description: "Our advanced AI analyzes your request and breaks it down into specific trades—like carpentry, plumbing, or electrical work—identifying exactly who needs to be involved.",
        icon: Cpu,
        color: "bg-purple-100 text-purple-600"
    },
    {
        id: 3,
        title: "Unified Quote",
        description: "Verified local professionals bid on the specific parts they specialize in. We combine them into a single, easy-to-understand quote for your entire project.",
        icon: FileCheck,
        color: "bg-green-100 text-green-600"
    }
];

const HowItWorks: React.FC = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="bg-[#0a1128] text-white py-20 px-6 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold mb-6"
                >
                    How QuoteMe Works
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-gray-300 max-w-2xl mx-auto"
                >
                    From idea to quote in three simple steps. We handle the complexity so you can focus on the result.
                </motion.p>
            </section>

            {/* Steps Section */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-gray-100 -z-10 transform -translate-y-1/2" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="flex flex-col items-center text-center bg-white p-6 rounded-2xl"
                        >
                            <div className={`w-24 h-24 rounded-full ${step.color} flex items-center justify-center mb-6 shadow-lg z-10 relative`}>
                                <step.icon className="w-10 h-10" />
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#0a1128] text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">
                                    {step.id}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">{step.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-gray-50 py-20 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6 text-gray-900">Ready to start your project?</h2>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Join thousands of homeowners who have simplified their renovation process with QuoteMe.</p>
                    <Link to="/request-quote" className="inline-flex items-center gap-2 bg-[#0a1128] text-white px-8 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        Post Your Project <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HowItWorks;
