import React from 'react';

const Terms: React.FC = () => {
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
                    <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                    <p className="text-gray-400 text-lg">Effective Date: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
                {/* Sidebar TOC */}
                <aside className="md:w-64 flex-shrink-0 hidden md:block">
                    <div className="sticky top-24">
                        <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Contents</h3>
                        <nav className="space-y-2 border-l-2 border-gray-200">
                            <button onClick={() => scrollToSection('acceptance')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-[#0a1128] hover:border-l-2 hover:border-[#0a1128] -ml-[2px] transition-all">Acceptance of Terms</button>
                            <button onClick={() => scrollToSection('user-obligations')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-[#0a1128] hover:border-l-2 hover:border-[#0a1128] -ml-[2px] transition-all">User Obligations</button>
                            <button onClick={() => scrollToSection('sp-obligations')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-[#0a1128] hover:border-l-2 hover:border-[#0a1128] -ml-[2px] transition-all">SP Obligations</button>
                            <button onClick={() => scrollToSection('liability')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-[#0a1128] hover:border-l-2 hover:border-[#0a1128] -ml-[2px] transition-all">Liability & Disclaimers</button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 prose prose-lg prose-blue max-w-none">
                    <section id="acceptance" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-600">
                            By accessing or using the QuoteMe platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section id="user-obligations" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Obligations</h2>
                        <p className="text-gray-600">
                            As a user seeking quotes, you agree to:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 mt-4 space-y-2">
                            <li>Provide accurate and complete information about your project.</li>
                            <li>Treat Service Providers with respect and professional courtesy.</li>
                            <li>Use the platform for legitimate home service inquiries only.</li>
                        </ul>
                    </section>

                    <section id="sp-obligations" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Service Provider Obligations</h2>
                        <p className="text-gray-600">
                            Service Providers (SPs) agree to:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 mt-4 space-y-2">
                            <li>Maintain active licenses and insurance as required by local laws.</li>
                            <li>Provide accurate quotes based on the information provided.</li>
                            <li>Perform work to professional standards.</li>
                            <li>Respect user privacy and data masking protocols.</li>
                        </ul>
                    </section>

                    <section id="liability" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Liability & Disclaimers</h2>
                        <p className="text-gray-600">
                            QuoteMe acts as a platform to connect users with Service Providers. We are not a party to any agreement entered into between users and Service Providers.
                        </p>
                        <div className="bg-gray-100 p-4 rounded-lg mt-4">
                            <p className="text-sm text-gray-500">
                                QuoteMe disclaims all liability for the actions, errors, or omissions of any Service Provider. Users are encouraged to verify the credentials of Service Providers independently before commencing work.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;
