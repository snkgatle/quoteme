import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText } from 'lucide-react';

interface TermsAndConditionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-2">
                                <div className="bg-primary-100 p-2 rounded-lg">
                                    <FileText className="w-5 h-5 text-primary-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Terms and Conditions</h2>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <p className="text-sm text-slate-600">
                                <strong>1. Acceptance of Terms</strong><br />
                                By accessing and using our platform, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                            </p>
                            <p className="text-sm text-slate-600">
                                <strong>2. Service Provider Responsibilities</strong><br />
                                As a Service Provider, you agree to perform services with due care and skill. You are responsible for maintaining valid licenses and certifications as required by law for the services you offer. You agree to represent your skills and qualifications accurately.
                            </p>
                            <p className="text-sm text-slate-600">
                                <strong>3. User Data & Privacy</strong><br />
                                We respect the privacy of our users. You agree to use customer data solely for the purpose of providing the requested services and to protect such data from unauthorized access or disclosure. Please refer to our Privacy Policy for more details.
                            </p>
                            <p className="text-sm text-slate-600">
                                <strong>4. Fees and Payments</strong><br />
                                Our platform may charge fees for certain services, such as lead generation or transaction processing. All fees will be clearly communicated prior to incurring any charges.
                            </p>
                            <p className="text-sm text-slate-600">
                                <strong>5. Termination</strong><br />
                                We reserve the right to terminate your access to the platform without cause or notice, which may result in the forfeiture and destruction of all information associated with your account.
                            </p>
                             <p className="text-sm text-slate-600">
                                <strong>6. Liability</strong><br />
                                The platform is provided "as is". We are not liable for any damages arising from the use or inability to use the services, or for any disputes between Service Providers and Customers.
                            </p>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TermsAndConditionsModal;
