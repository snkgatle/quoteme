import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, DollarSign, FileText, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Project {
    id: string;
    description: string;
    requiredTrades: string[];
    user?: {
        name: string;
    };
}

interface QuoteFormProps {
    project: Project;
    onClose: () => void;
    onSubmitSuccess: () => void;
}

const schema = z.object({
    amount: z.number({ invalid_type_error: "Amount must be a number" }).positive("Bid amount must be positive"),
    proposal: z.string().min(10, "Please provide at least 10 characters of details"),
});

type QuoteFormData = z.infer<typeof schema>;

const QuoteForm: React.FC<QuoteFormProps> = ({ project, onClose, onSubmitSuccess }) => {
    const { token } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<QuoteFormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: QuoteFormData) => {
        try {
            const response = await fetch('/api/quotes/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    requestId: project.id,
                    amount: data.amount,
                    proposal: data.proposal,
                    trade: project.requiredTrades[0] || 'General',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit quote');
            }

            onSubmitSuccess();
        } catch (error: any) {
            console.error('Submission error:', error);
            setError('root', {
                type: 'manual',
                message: error.message || 'An unexpected error occurred.',
            });
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex justify-end">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black"
                />

                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-md bg-white shadow-xl h-full flex flex-col"
                >
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900">Submit Quote</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-1">Request Details</h3>
                            <p className="font-semibold text-gray-900 mb-1">{project.description}</p>
                            <p className="text-xs text-blue-700 mb-3">User: {project.user?.name || 'Anonymous User'}</p>

                            <div className="bg-white/50 p-2 rounded-lg border border-blue-200 flex items-start gap-2">
                                <Shield className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-slate-600 leading-tight">
                                    <strong>Data Masking:</strong> Customer contact details are hidden to protect privacy. Full details will be revealed upon quote acceptance.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Category</label>
                                <input
                                    type="text"
                                    value={project.requiredTrades.join(', ')}
                                    readOnly
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Bid Amount ($)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...register('amount', { valueAsNumber: true })}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                                            errors.amount ? 'border-red-300 focus:ring-red-200' : 'border-gray-300'
                                        }`}
                                    />
                                </div>
                                {errors.amount && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.amount.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="proposal" className="block text-sm font-medium text-gray-700 mb-1">Quote Details</label>
                                <div className="relative">
                                     <div className="absolute top-3 left-3 pointer-events-none">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        id="proposal"
                                        rows={5}
                                        placeholder="Breakdown of costs, terms, timeline..."
                                        {...register('proposal')}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                                            errors.proposal ? 'border-red-300 focus:ring-red-200' : 'border-gray-300'
                                        }`}
                                    />
                                </div>
                                {errors.proposal && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.proposal.message}
                                    </p>
                                )}
                            </div>

                            {errors.root && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                                    {errors.root.message}
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Submit Quote
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default QuoteForm;
