import React, { useState, useRef, useEffect } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { Upload, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

    const [file, setFile] = useState<File | null>(null);
    const [addressInput, setAddressInput] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const { token, login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                businessName: user.name || prev.businessName,
                bio: user.bio || prev.bio,
                latitude: user.latitude ?? prev.latitude,
                longitude: user.longitude ?? prev.longitude,
                services: user.trades || prev.services,
            }));
        }
    }, [user]);

    // Fields for unauthenticated registration
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
            if (lat && lng) {
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                if (place.formatted_address) {
                    setAddressInput(place.formatted_address);
                }
            } else {
                setFormData(prev => ({ ...prev, latitude: null, longitude: null }));
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
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFormData(prev => ({ ...prev, isQualified: true }));
        }
    };

    const handleSubmit = async () => {
        if (formData.latitude === null || formData.longitude === null) {
            alert("Please select a valid address from the Google Maps suggestions.");
            return;
        }

        let currentToken = token;

        // If not logged in, register first
        if (!currentToken) {
            if (!email || !password) {
                alert("Please provide an email and password to create your account.");
                return;
            }

            try {
                const authResponse = await fetch('/api/auth/sp/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        password,
                        latitude: formData.latitude,
                        longitude: formData.longitude
                    }),
                });

                const authData = await authResponse.json();
                if (!authResponse.ok) {
                    throw new Error(authData.error || 'Registration failed');
                }

                currentToken = authData.token;
                login(authData.token, authData.user);
            } catch (error: any) {
                console.error(error);
                alert(`Registration failed: ${error.message}`);
                return;
            }
        }

        try {
            const data = new FormData();
            data.append('businessName', formData.businessName);
            // Use bio if edited, otherwise fallback to notes or empty string
            data.append('bio', formData.bio || formData.notes || '');
            if (formData.latitude) data.append('latitude', String(formData.latitude));
            if (formData.longitude) data.append('longitude', String(formData.longitude));
            data.append('services', JSON.stringify(formData.services));

            if (file) {
                data.append('certification', file);
            }

            const response = await fetch('/api/sp/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                },
                body: data,
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            navigate('/admin');
        } catch (error) {
            console.error(error);
            alert('Failed to submit profile');
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

                {/* Registration Info (if not logged in) */}
                {!token && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4">
                        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide">Account Details</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                )}

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
                                value={addressInput}
                                onChange={(e) => {
                                    setAddressInput(e.target.value);
                                    setFormData(prev => ({ ...prev, latitude: null, longitude: null }));
                                }}
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
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Review & Edit Bio</h4>
                                <span className={`text-xs ${formData.bio.length > 300 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                    {formData.bio.length}/300
                                </span>
                            </div>
                            <textarea
                                className="w-full text-sm text-gray-700 leading-relaxed italic border-none bg-transparent focus:ring-0 resize-none h-32"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                            {formData.bio.length > 300 && (
                                <p className="text-xs text-red-500 mt-1">
                                    Bio is too long for mobile view. Please edit to shorten it.
                                </p>
                            )}
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

                <button
                    onClick={handleSubmit}
                    className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all hover:-translate-y-0.5">
                    Complete Registration
                </button>
            </div>
        </motion.div>
    );
};

export default SPOnboardingForm;
