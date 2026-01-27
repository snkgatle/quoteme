import React from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { Star, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';

interface ProfilePreviewProps {
    businessName: string;
    bio: string;
    services: string[];
    latitude: number | null;
    longitude: number | null;
    isLoaded: boolean;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.75rem',
};

const ProfilePreview: React.FC<ProfilePreviewProps> = ({
    businessName,
    bio,
    services,
    latitude,
    longitude,
    isLoaded
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 my-6"
        >
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold mb-1">{businessName || 'Your Business Name'}</h3>
                        <div className="flex items-center space-x-2 text-primary-100 text-sm">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Verified License</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300 mr-1" />
                            <span className="font-bold">5.0</span>
                            <span className="text-xs ml-1 font-bold opacity-90">(New)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">About the Pro</h4>
                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                {bio || 'Your AI-enhanced bio will appear here...'}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Services</h4>
                            <div className="flex flex-wrap gap-2">
                                {services.length > 0 ? services.map(service => (
                                    <span key={service} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                        {service}
                                    </span>
                                )) : (
                                    <span className="text-gray-400 text-xs italic">No services selected</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-1/3 h-48 bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200">
                        {isLoaded && latitude && longitude ? (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={{ lat: latitude, lng: longitude }}
                                zoom={14}
                                options={{
                                    disableDefaultUI: true,
                                    zoomControl: false,
                                    draggable: false,
                                    scrollwheel: false,
                                }}
                            >
                                <Marker position={{ lat: latitude, lng: longitude }} />
                            </GoogleMap>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <span className="text-xs">Location Preview</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs text-gray-500 font-medium">
                        Quote # PREVIEW
                    </div>
                    <div className="flex items-center text-primary-600 text-sm font-bold">
                         Preview Mode <CheckCircle className="w-4 h-4 ml-1" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfilePreview;
