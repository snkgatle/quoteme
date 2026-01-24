import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, User, Star, Check } from 'lucide-react';

interface SP {
    id: string;
    name: string;
    rating: number;
    isSelected: boolean;
}

interface SwitchSPProps {
    trade: string;
    providers: SP[];
    onSwitch: (id: string) => void;
}

const SwitchSP: React.FC<SwitchSPProps> = ({ trade, providers, onSwitch }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 capitalize">{trade} Experts</h3>
                <RefreshCcw className="w-4 h-4 text-gray-400 animate-spin-slow" />
            </div>

            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {providers.map((sp) => (
                        <motion.button
                            key={sp.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => onSwitch(sp.id)}
                            className={`w-full flex items-center p-3 rounded-xl border transition-all ${sp.isSelected
                                    ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                                    : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${sp.isSelected ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                <User className="w-5 h-5" />
                            </div>

                            <div className="flex-1 text-left">
                                <p className={`font-semibold text-sm ${sp.isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                                    {sp.name}
                                </p>
                                <div className="flex items-center text-xs text-amber-500">
                                    <Star className="w-3 h-3 fill-current mr-1" />
                                    <span>{sp.rating.toFixed(1)}</span>
                                </div>
                            </div>

                            {sp.isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="bg-primary-500 rounded-full p-1"
                                >
                                    <Check className="w-3 h-3 text-white" />
                                </motion.div>
                            )}
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SwitchSP;
