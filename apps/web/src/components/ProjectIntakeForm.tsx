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
        googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with actual key
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-green-100 text-center"
            >
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Project Submitted!</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Our AI is currently deconstructing your project into specific trades.
                    Local experts will be notified shortly.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mb-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Project ID</p>
                    <p className="text-lg font-mono text-primary-700 font-bold">{submittedId}</p>
                </div>
                <button
                    onClick={() => window.location.href = '/'}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-colors"
                >
                    Back to Home
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
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100"
                >
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your project</h3>
                                <p className="text-gray-500 text-sm">Be as descriptive as possible. Our AI will handle the rest.</p>
                            </div>
                            <div className="relative group">
                                <textarea
                                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl h-48 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all resize-none text-gray-700 bg-white/50 backdrop-blur-sm relative z-10"
                                    placeholder="Example: I need to install a new kitchen island, rewire the lighting, and fix a leaky faucet in the bathroom..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                <div className="absolute top-4 right-4 text-primary-200 group-focus-within:text-primary-500 transition-colors z-0">
                                    <Sparkles className="w-8 h-8 opacity-20" />
                                </div>
                            </div>
                            <button
                                disabled={!formData.description}
                                onClick={nextStep}
                                className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-200"
                            >
                                Next Step <ChevronRight className="w-5 h-5" />
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
