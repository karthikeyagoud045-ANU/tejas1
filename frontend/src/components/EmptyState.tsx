import React from 'react';
import { FileText, Pill, Utensils, Users, Watch, Upload } from 'lucide-react';

interface EmptyStateProps {
    type: 'reports' | 'medications' | 'meals' | 'family' | 'wearables' | 'generic';
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EMPTY_STATE_CONFIG = {
    reports: {
        icon: FileText,
        title: 'No Reports Yet',
        description: 'Upload your first medical report to get AI-powered insights and recommendations.',
        actionLabel: 'Upload Report'
    },
    medications: {
        icon: Pill,
        title: 'No Medications Added',
        description: 'Add your medications to track dosages and never miss a dose.',
        actionLabel: 'Add Medication'
    },
    meals: {
        icon: Utensils,
        title: 'No Meals Logged',
        description: 'Take a photo of your meal to track calories and nutrition.',
        actionLabel: 'Log Meal'
    },
    family: {
        icon: Users,
        title: 'No Family Members',
        description: 'Add family members to manage their health profiles.',
        actionLabel: 'Add Family Member'
    },
    wearables: {
        icon: Watch,
        title: 'No Devices Connected',
        description: 'Connect your fitness tracker or smartwatch to sync health data.',
        actionLabel: 'Connect Device'
    },
    generic: {
        icon: Upload,
        title: 'Nothing Here Yet',
        description: 'Get started by adding some data.',
        actionLabel: 'Get Started'
    }
};

const EmptyState: React.FC<EmptyStateProps> = ({
    type,
    title,
    description,
    actionLabel,
    onAction
}) => {
    const config = EMPTY_STATE_CONFIG[type];
    const Icon = config.icon;

    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            {/* Icon Container */}
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5 animate-pulse">
                <Icon className="w-10 h-10 text-slate-300" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-700 mb-2">
                {title || config.title}
            </h3>

            {/* Description */}
            <p className="text-slate-500 max-w-sm mb-6 leading-relaxed">
                {description || config.description}
            </p>

            {/* Action Button */}
            {onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl active:scale-95 flex items-center gap-2"
                >
                    <Icon className="w-4 h-4" />
                    {actionLabel || config.actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
