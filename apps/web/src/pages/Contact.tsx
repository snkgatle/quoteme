import React from 'react';
import { Mail, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useForm } from 'react-hook-form';

type ContactFormData = {
    name: string;
    email: string;
    subject: string;
    message: string;
};

const Contact: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<ContactFormData>();

    const onSubmit = (data: ContactFormData) => {
        console.log("Form submitted:", data);
        alert("Thank you for contacting us! We will get back to you shortly.");
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-[#0a1128] text-white py-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
                {/* Contact Form */}
                <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 order-2 md:order-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    {...register("name", { required: "Name is required" })}
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0a1128] focus:ring-2 focus:ring-[#0a1128]/20 transition-all outline-none"
                                    placeholder="John Doe"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
                                    })}
                                    type="email"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0a1128] focus:ring-2 focus:ring-[#0a1128]/20 transition-all outline-none"
                                    placeholder="john@example.com"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                            <input
                                {...register("subject", { required: "Subject is required" })}
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0a1128] focus:ring-2 focus:ring-[#0a1128]/20 transition-all outline-none"
                                placeholder="How can we help?"
                            />
                            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <textarea
                                {...register("message", { required: "Message is required" })}
                                rows={5}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0a1128] focus:ring-2 focus:ring-[#0a1128]/20 transition-all outline-none resize-none"
                                placeholder="Tell us more about your inquiry..."
                            />
                            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                        </div>

                        <button type="submit" className="w-full bg-[#0a1128] text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg">
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Sidebar Info */}
                <aside className="md:w-80 flex-shrink-0 order-1 md:order-2 space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Mail className="w-5 h-5" /> Contact Info
                        </h3>
                        <div className="space-y-4 text-gray-600">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Support Email</p>
                                <a href="mailto:support@quoteme.com" className="text-[#0a1128] font-medium hover:underline">support@quoteme.com</a>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-400">Response Time</p>
                                <p className="font-medium">Usually within 24 hours</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0a1128] text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-gray-400 mb-2">Built by</p>
                            <h3 className="text-3xl font-black tracking-tight mb-6">KEmpire</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Crafting digital experiences that simplify the complex. QuoteMe is our flagship platform for home services.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                        {/* Abstract Background Element */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Contact;
