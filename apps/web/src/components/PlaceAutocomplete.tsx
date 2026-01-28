import React, { useEffect, useRef } from 'react';

interface PlaceAutocompleteProps {
    onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
    className?: string;
}

const PlaceAutocomplete: React.FC<PlaceAutocompleteProps> = ({ onPlaceSelect, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !window.google) return;

        // Create the new PlaceAutocompleteElement
        // @ts-ignore - The element might not be in the types yet
        const autocompleteElement = new google.maps.places.PlaceAutocompleteElement();

        const element = autocompleteElement as HTMLElement;

        // Apply styles via CSS variables to pierce the Shadow DOM
        element.style.setProperty('--gmpx-color-surface', '#ffffff');
        element.style.setProperty('--gmpx-color-on-surface', '#1f2937'); // gray-800
        element.style.setProperty('--gmpx-border-radius', '0.5rem'); // default rounded-lg
        element.style.setProperty('width', '100%');

        // Add classes for external positioning/layout
        if (className) {
            element.className = className;
        }

        const handlePlaceSelect = (event: any) => {
            onPlaceSelect(event.place);
        };

        element.addEventListener('gmp-placeselect', handlePlaceSelect);
        containerRef.current.appendChild(element);

        return () => {
            element.removeEventListener('gmp-placeselect', handlePlaceSelect);
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [onPlaceSelect, className]);

    return (
        <div ref={containerRef} />
    );
};

export default PlaceAutocomplete;
