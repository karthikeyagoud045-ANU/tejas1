import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    fullScreen?: boolean;
}

const SIZE_CLASSES = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message,
    fullScreen = false
}) => {
    const content = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                {/* Spinner */}
                <Loader2 className={`${SIZE_CLASSES[size]} text-blue-600 animate-spin relative z-10`} />
            </div>
            {message && (
                <p className="text-slate-500 font-medium text-sm animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-8">
            {content}
        </div>
    );
};

export default LoadingSpinner;
