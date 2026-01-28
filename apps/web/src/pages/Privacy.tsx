import React from 'react';

const Privacy: React.FC = () => {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-[#0a1128] text-white py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-gray-400 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
                {/* Sidebar TOC */}
                <aside className="md:w-64 flex-shrink-0 hidden md:block">
                    <div className="sticky top-24">
                        <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Contents</h3>
                        <nav className="space-y-2 border-l-2 border-gray-200">
                            <button onClick={() => scrollToSection('introduction')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-[#0a1128] hover:border-l-2 hover:border-[#0a1128] -ml-[2px] transition-all">Introduction</button>
                            <button onClick={() => scrollToSection('ai-processing')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-[#0a1128] hover:border-l-2 hover:border-[#0a1128] -ml-[2px] transition-all">AI Data Processing</button>
                            <button onClick={() => scrollToSection('data-masking')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-[#0a1128] hover:border-l-2 hover:border-[#0a1128] -ml-[2px] transition-all">SP Data Masking</button>
                            <button onClick={() => scrollToSection('contact-privacy')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-[#0a1128] hover:border-l-2 hover:border-[#0a1128] -ml-[2px] transition-all">User Contact Privacy</button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 prose prose-lg prose-blue max-w-none">
                    <section id="introduction" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                        <p className="text-gray-600">
                            At QuoteMe, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform to request quotes for home services.
                        </p>
                    </section>

                    <section id="ai-processing" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. AI Data Processing</h2>
                        <p className="text-gray-600">
                            We utilize advanced Artificial Intelligence (AI) to analyze your project descriptions. This processing allows us to:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 mt-4 space-y-2">
                            <li>Deconstruct complex project requests into specific trade requirements.</li>
                            <li>Match your project with the most suitable Service Providers.</li>
                            <li>Estimate project scope and complexity.</li>
                        </ul>
                        <p className="text-gray-600 mt-4">
                            All data processed by our AI is handled securely, and the AI models are trained to prioritize user privacy and data security.
                        </p>
                    </section>

                    <section id="data-masking" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Service Provider Data Masking</h2>
                        <p className="text-gray-600">
                            To ensure fair competition and privacy, specific details about Service Providers are masked during the initial quoting phase. You will see:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 mt-4 space-y-2">
                            <li>Anonymized ratings and reviews.</li>
                            <li>General location (e.g., "Within 5km").</li>
                            <li>Qualifications and badges.</li>
                        </ul>
                        <p className="text-gray-600 mt-4">
                            Full Service Provider identities are revealed only after a quote is generated and you choose to proceed.
                        </p>
                    </section>

                    <section id="contact-privacy" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Contact Privacy</h2>
                        <p className="text-gray-600">
                            Your personal contact information (Phone Number, Email, Exact Address) is <strong>never</strong> shared with Service Providers during the bidding process.
                        </p>
                        <div className="bg-blue-50 border-l-4 border-[#0a1128] p-4 mt-6">
                            <p className="text-gray-800 font-medium">
                                Contact details are only released to a Service Provider when you explicitly accept their quote or the Unified Quote containing their bid.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
