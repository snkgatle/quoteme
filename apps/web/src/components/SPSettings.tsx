import React, { useState, useRef, useEffect } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { Upload, Sparkles, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from './ErrorBoundary';

const libraries: ("places")[] = ["places"];

const SPSettings: React.FC = () => {
    const { user, token, login, logout } = useAuth();
    const [formData, setFormData] = useState({
        businessName: '',
        services: [] as string[],
        notes: '',
        bio: '',
        latitude: null as number | null,
        longitude: null as number | null,
    });

    const [file, setFile] = useState<File | null>(null);
    const [addressInput, setAddressInput] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [availableServices, setAvailableServices] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        libraries
    });

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
            // We don't have address string in user object, so we can't prefill addressInput easily
            // unless we reverse geocode or store it. For now, we leave it empty or show a placeholder.
            if (user.latitude && user.longitude) {
                setAddressInput(`Lat: ${user.latitude}, Lng: ${user.longitude}`);
            }
        }
    }, [user]);

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const response = await fetch('/api/sp/available-trades');
                const data = await response.json();
                if (data.trades) {
                    setAvailableServices(data.trades);
                }
            } catch (error) {
                console.error('Failed to fetch trades', error);
                setAvailableServices(["Plumbing", "Electrical", "Carpenter", "Painting", "Roofing", "Landscaping"]);
            }
        };
        fetchTrades();
    }, []);

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

            if (response.status === 401) {
                logout();
                return;
            }

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
        }
    };

    const handleSubmit = async () => {
        if (!token) return;
        setIsSubmitting(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const data = new FormData();
            if (formData.businessName) data.append('businessName', formData.businessName);
            // Use bio if edited, otherwise fallback to notes or empty string if not present
            if (formData.bio || formData.notes) data.append('bio', formData.bio || formData.notes);
            if (formData.latitude) data.append('latitude', String(formData.latitude));
            if (formData.longitude) data.append('longitude', String(formData.longitude));
            data.append('services', JSON.stringify(formData.services));

            if (file) {
                data.append('certification', file);
            }

            const response = await fetch('/api/sp/profile', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data,
            });

            if (response.status === 401) {
                logout();
                return;
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update profile');
            }

            // Update local user context
            if (result.user) {
                login(token, result.user);
            }

            setSuccessMessage('Profile updated successfully!');
            setFile(null); // Clear file input
        } catch (error: any) {
            console.error(error);
            setErrorMessage(error.message || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
        >
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                <p className="text-gray-500">Update your business information and public profile.</p>
            </div>

            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 border border-green-100">
                    <CheckCircle className="w-5 h-5" />
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 border border-red-100">
                    <AlertCircle className="w-5 h-5" />
                    {errorMessage}
                </div>
            )}

            <div className="space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">

                {/* Business Name */}
                <ErrorBoundary>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">Business Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        />
                    </div>
                </ErrorBoundary>

                {/* Location */}
                <ErrorBoundary fallback={<div className="p-4 bg-red-50 text-red-700 rounded-lg">Location search unavailable</div>}>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">
                            <MapPin className="inline w-4 h-4 mr-1 text-primary-500" />
                            Service Area (Google Maps)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Updating this will re-validate your coordinates.</p>
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
                                        // Reset lat/long if user clears/edits input manually to force selection?
                                        // Ideally we wait for selection.
                                    }}
                                />
                            </Autocomplete>
                        )}
                        {formData.latitude && formData.longitude && (
                            <p className="mt-1 text-xs text-green-600 font-mono">
                                Verified: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                            </p>
                        )}
                    </div>
                </ErrorBoundary>

                {/* Trades */}
                <ErrorBoundary>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Services Provided</label>
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
                </ErrorBoundary>

                {/* AI Bio */}
                <ErrorBoundary fallback={<div className="p-4 bg-red-50 text-red-700 rounded-lg">AI Assistant unavailable</div>}>
                    <div className="bg-primary-50 p-6 rounded-xl border border-primary-100">
                        <label className="block text-sm font-bold text-primary-900 mb-2">
                            <Sparkles className="inline w-4 h-4 mr-1 text-primary-600" />
                            Business Description (AI Enhanced)
                        </label>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-primary-700 mb-1">Rough Notes / Ideas</label>
                            <textarea
                                className="w-full px-4 py-2 border border-primary-200 rounded-lg h-24 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                placeholder="e.g. 10 years experience in residential plumbing, specialized in leak detection..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                            <button
                                onClick={enhanceBio}
                                disabled={isEnhancing || !formData.notes}
                                className="mt-2 text-sm font-bold text-primary-600 hover:text-primary-800 disabled:opacity-50 flex items-center gap-1"
                            >
                                <Sparkles className="w-3 h-3" />
                                {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                            </button>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-semibold text-primary-700">Final Bio</label>
                                <span className={`text-xs ${formData.bio.length > 300 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                    {formData.bio.length}/300
                                </span>
                            </div>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg h-32 focus:ring-2 focus:ring-primary-500 outline-none text-sm leading-relaxed"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                maxLength={300}
                            />
                        </div>
                    </div>
                </ErrorBoundary>

                {/* Certification */}
                <ErrorBoundary>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Certifications & Licenses</label>

                        {user?.certification_url && (
                            <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg flex items-center gap-2 text-sm border border-blue-100">
                                <CheckCircle className="w-4 h-4" />
                                <span>Current Certification uploaded. Uploading a new one will replace it and trigger re-verification.</span>
                            </div>
                        )}

                        <div className="relative group">
                            <input
                                type="file"
                                className="hidden"
                                id="cert-upload-settings"
                                onChange={handleFileUpload}
                            />
                            <label
                                htmlFor="cert-upload-settings"
                                className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer group-hover:border-primary-500 transition-colors bg-gray-50 group-hover:bg-white"
                            >
                                <div className="text-center">
                                    <Upload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-primary-500 mb-2" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {file ? file.name : "Click to upload new certification"}
                                    </span>
                                    {!file && <p className="text-xs text-gray-500 mt-1">PDF or JPG only</p>}
                                </div>
                            </label>
                        </div>
                    </div>
                </ErrorBoundary>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:translate-y-0"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default SPSettings;
