import React from 'react';

export const SkeletonCard = () => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-2 w-3/4">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-10"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>

            <div className="flex items-center gap-3">
                <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
            </div>
        </div>
    );
};

export const SkeletonList = ({ count = 3 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-1 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
};
