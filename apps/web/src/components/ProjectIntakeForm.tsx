import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, FileText, Upload, CheckCircle, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const libraries: ("places")[] = ["places"];

const ProjectIntakeForm: React.FC = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        description: '',
        address: '',
        latitude: null as number | null,
        longitude: null as number | null,
        files: [] as File[],
        userEmail: '',
        userName: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedId, setSubmittedId] = useState<string | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        libraries
    });

    const handlePlaceSelect = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();
            if (lat && lng && place.formatted_address) {
                setFormData(prev => ({
                    ...prev,
                    address: place.formatted_address || '',
                    latitude: lat,
                    longitude: lng
                }));
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFormData(prev => ({
                ...prev,
                files: [...prev.files, ...Array.from(e.target.files!)]
            }));
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/submit-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: formData.userEmail,
                    userName: formData.userName,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    description: formData.description
                }),
            });
            const data = await response.json();
            if (data.projectId) {
                setSubmittedId(data.projectId);
                setStep(4); // Success step
            }
        } catch (error) {
            console.error('Submission failed', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    if (submittedId) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto bg-white p-12 rounded-[40px] shadow-2xl border border-primary-50 text-center"
            >
                <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-8 text-white shadow-lg shadow-primary-200">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Project Submitted!</h2>
                <p className="text-lg text-gray-500 mb-10 leading-relaxed font-medium">
                    Our AI is currently deconstructing your project into specific trades.
                    Local experts will be notified shortly.
                </p>
                <div className="bg-gray-50 rounded-2xl p-6 mb-10 border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Project Tracking ID</p>
                    <p className="text-2xl font-black text-primary-600 tracking-tighter">{submittedId}</p>
                </div>
                <button
                    onClick={() => window.location.href = '/'}
                    className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold hover:bg-black transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                >
                    Return to Home
                </button>
            </motion.div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6">
            <div className="max-w-xl mx-auto">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary-500' : 'bg-gray-200'}`}
                        />
                    ))}
                </div>

                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white p-10 rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-gray-50"
                >
                    {step === 1 && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">What do you need?</h3>
                                <p className="text-gray-500 font-medium">Describe your vision in plain English. Our AI will handle the technical details.</p>
                            </div>
                            <div className="relative">
                                <textarea
                                    className="w-full px-6 py-6 border-2 border-gray-100 rounded-3xl h-56 focus:ring-8 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all resize-none text-gray-700 font-medium text-lg bg-gray-50/50"
                                    placeholder="I'm planning a kitchen renovation involving new cabinets, electrical rewiring for an island, and plumbing for a second sink..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                <div className="absolute top-6 right-6 text-primary-200">
                                    <Sparkles className="w-8 h-8 opacity-40 animate-pulse" />
                                </div>
                            </div>
                            <button
                                disabled={!formData.description}
                                onClick={nextStep}
                                className="w-full bg-primary-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-primary-500 disabled:opacity-30 transition-all shadow-xl shadow-primary-200 hover:-translate-y-1 active:translate-y-0"
                            >
                                Continue <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Project Location</h3>
                                <p className="text-gray-500 text-sm">We use this to find experts available in your area.</p>
                            </div>
                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-sm font-semibold text-gray-700 px-1">Address</span>
                                    {isLoaded && (
                                        <Autocomplete
                                            onLoad={ref => autocompleteRef.current = ref}
                                            onPlaceChanged={handlePlaceSelect}
                                        >
                                            <div className="relative mt-1">
                                                <input
                                                    type="text"
                                                    placeholder="Search project address..."
                                                    className="w-full px-5 py-4 pl-12 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                                                    defaultValue={formData.address}
                                                />
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            </div>
                                        </Autocomplete>
                                    )}
                                </label>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={prevStep} className="px-6 py-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    disabled={!formData.latitude}
                                    onClick={nextStep}
                                    className="flex-1 bg-primary-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-200"
                                >
                                    Next Step <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Final Details</h3>
                                <p className="text-gray-500 text-sm">Almost there! We just need some contact info.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="block">
                                        <span className="text-sm font-semibold text-gray-700 px-1">Full Name</span>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-4 mt-1 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                            value={formData.userName}
                                            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-semibold text-gray-700 px-1">Email Address</span>
                                        <input
                                            type="email"
                                            className="w-full px-5 py-4 mt-1 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                            value={formData.userEmail}
                                            onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                                        />
                                    </label>
                                </div>

                                <div>
                                    <span className="text-sm font-semibold text-gray-700 px-1">Project Plans (Optional)</span>
                                    <div className="mt-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 hover:border-primary-500 transition-colors bg-gray-50">
                                        <label className="cursor-pointer text-center">
                                            <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                                            <span className="text-sm font-medium text-gray-600 block">Click to upload architectural plans or photos</span>
                                            <span className="text-xs text-gray-400">PDF, JPG, PNG up to 10MB</span>
                                            <input type="file" multiple className="hidden" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                    {formData.files.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {formData.files.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-primary-600 font-semibold bg-primary-50 px-3 py-2 rounded-lg">
                                                    <FileText className="w-4 h-4" /> {f.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={prevStep} className="px-6 py-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    disabled={isSubmitting || !formData.userEmail || !formData.userName}
                                    onClick={handleSubmit}
                                    className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black disabled:opacity-50 transition-all shadow-lg"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Project'} <CheckCircle className="w-5 h-5 ml-1" />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ProjectIntakeForm;
