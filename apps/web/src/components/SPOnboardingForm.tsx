import React, { useState, useRef } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { Upload, Sparkles, MapPin } from 'lucide-react';

const libraries: ("places")[] = ["places"];

const SPOnboardingForm: React.FC = () => {
    const [formData, setFormData] = useState({
        businessName: '',
        contactInfo: '',
        services: [] as string[],
        notes: '',
        bio: '',
        latitude: null as number | null,
        longitude: null as number | null,
        isQualified: false,
    });

    const [isEnhancing, setIsEnhancing] = useState(false);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Note to user: Replace with actual key
        libraries
    });

    const handlePlaceSelect = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();
            if (lat && lng) {
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
            }
        }
    };

    const enhanceBio = async () => {
        if (!formData.notes) return;
        setIsEnhancing(true);
        try {
            const response = await fetch('/api/sp/generate-bio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: formData.notes }),
            });
            const data = await response.json();
            setFormData(prev => ({ ...prev, bio: data.bio }));
        } catch (error) {
            console.error('Enhancement failed', error);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Logic for 'Qualified' vs 'Unqualified'
            // Stub: If a file is uploaded, we mark as qualified for now.
            setFormData(prev => ({ ...prev, isQualified: true }));
            alert(`Certification "${file.name}" uploaded. Business marked as Qualified.`);
        }
    };

    const availableServices = ["Plumbing", "Electrical", "Carpentry", "Painting", "Roofing", "Landscaping"];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
        >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Provider Onboarding</h2>

            <div className="space-y-6">
                {/* Business Info */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    />
                </div>

                {/* Location with Google Maps */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="inline w-4 h-4 mr-1 text-primary-500" />
                        Address (Google Maps Autocomplete)
                    </label>
                    {isLoaded && (
                        <Autocomplete
                            onLoad={(ref) => autocompleteRef.current = ref}
                            onPlaceChanged={handlePlaceSelect}
                        >
                            <input
                                type="text"
                                placeholder="Search business address..."
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </Autocomplete>
                    )}
                </div>

                {/* Multi-select Services */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Services Provided</label>
                    <div className="flex flex-wrap gap-2">
                        {availableServices.map(service => (
                            <button
                                key={service}
                                onClick={() => {
                                    const current = formData.services.includes(service)
                                        ? formData.services.filter(s => s !== service)
                                        : [...formData.services, service];
                                    setFormData({ ...formData, services: current });
                                }}
                                className={`px-3 py-1 rounded-full text-sm border transition-colors ${formData.services.includes(service)
                                        ? 'bg-primary-500 text-white border-primary-500'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary-500'
                                    }`}
                            >
                                {service}
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI Bio Section */}
                <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                        <Sparkles className="inline w-4 h-4 mr-1 text-primary-600" />
                        AI Assistant (Rough Notes)
                    </label>
                    <textarea
                        className="w-full px-4 py-2 border border-primary-200 rounded-lg h-24 focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Type some rough notes about your experience and skills..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                    <button
                        onClick={enhanceBio}
                        disabled={isEnhancing || !formData.notes}
                        className="mt-2 text-sm font-semibold text-primary-700 hover:text-primary-800 disabled:opacity-50"
                    >
                        {isEnhancing ? 'Enhancing...' : 'Enhance with AI ✨'}
                    </button>

                    {formData.bio && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-primary-200 shadow-sm">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Generated Bio</h4>
                            <p className="text-sm text-gray-700 leading-relaxed italic">"{formData.bio}"</p>
                        </div>
                    )}
                </div>

                {/* Certification Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certifications & Licenses</label>
                    <div className="relative group">
                        <input
                            type="file"
                            className="hidden"
                            id="cert-upload"
                            onChange={handleFileUpload}
                        />
                        <label
                            htmlFor="cert-upload"
                            className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer group-hover:border-primary-500 transition-colors"
                        >
                            <div className="text-center">
                                <Upload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-primary-500 mb-2" />
                                <span className="text-sm text-gray-600">Click to upload certification</span>
                            </div>
                        </label>
                    </div>
                    {formData.isQualified && (
                        <p className="mt-2 text-xs font-bold text-green-600 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Verified: Qualified Service Provider
                        </p>
                    )}
                </div>

                <button className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all hover:-translate-y-0.5">
                    Complete Registration
                </button>
            </div>
        </motion.div>
    );
};

export default SPOnboardingForm;
