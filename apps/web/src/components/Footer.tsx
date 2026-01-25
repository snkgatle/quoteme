import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-white py-16 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <img src="/assets/final01.png" alt="QuoteMe Logo" className="h-10 w-auto brightness-0 invert" />
                        <span className="text-2xl font-black tracking-tighter">QuoteMe</span>
                    </div>
                    <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
                        The world's first AI-driven project deconstruction platform. We simplify home services by turning your vision into a unified quote.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors">
                            <Twitter className="w-5 h-5 text-white" />
                        </a>
                        <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors">
                            <Instagram className="w-5 h-5 text-white" />
                        </a>
                        <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors">
                            <Linkedin className="w-5 h-5 text-white" />
                        </a>
                        <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors">
                            <Facebook className="w-5 h-5 text-white" />
                        </a>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-gray-500">Platform</h4>
                    <ul className="space-y-4 text-gray-400 font-medium">
                        <li><Link to="/request-quote" className="hover:text-primary-400 transition-colors">Request a Quote</Link></li>
                        <li><Link to="/onboard" className="hover:text-primary-400 transition-colors">Join as Provider</Link></li>
                        <li><Link to="/admin" className="hover:text-primary-400 transition-colors">SP Portal</Link></li>
                        <li><a href="#" className="hover:text-primary-400 transition-colors">How it Works</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-gray-500">Company</h4>
                    <ul className="space-y-4 text-gray-400 font-medium">
                        <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
                        <li><a href="#" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
                        <li className="pt-4 border-t border-gray-800 mt-4">
                            <p className="text-xs text-gray-600">Built by</p>
                            <p className="text-lg font-black tracking-tight text-white">KEmpire</p>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-gray-800 text-center md:text-left">
                <p className="text-gray-500 text-sm font-medium">
                    &copy; {new Date().getFullYear()} QuoteMe by KEmpire. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
