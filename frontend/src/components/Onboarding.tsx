import React, { useState } from 'react';
import { ChevronRight, Heart, Target, User, Sparkles } from 'lucide-react';
import { syncService } from '../services/syncService';

interface OnboardingProps {
    onComplete: () => void;
}

const STEPS = [
    { id: 'welcome', icon: Sparkles, title: 'Welcome to HealthWise.AI' },
    { id: 'name', icon: User, title: "What's your name?" },
    { id: 'conditions', icon: Heart, title: 'Any health conditions?' },
    { id: 'goals', icon: Target, title: 'What are your goals?' }
];

const CONDITIONS = [
    'Diabetes', 'Hypertension', 'Heart Disease',
    'Thyroid', 'Pregnancy', 'None'
];

const GOALS = [
    'Lose Weight', 'Build Muscle', 'Track Medications',
    'Improve Diet', 'Monitor Health', 'Stay Fit'
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [conditions, setConditions] = useState<string[]>([]);
    const [goals, setGoals] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const handleNext = async () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            // Save profile and complete
            setSaving(true);
            await syncService.saveProfile({
                name,
                conditions,
                goals,
                onboarding_done: true
            });
            localStorage.setItem('hw_onboarding_done', 'true');
            setSaving(false);
            onComplete();
        }
    };

    const toggleItem = (item: string, list: string[], setList: (l: string[]) => void) => {
        setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
    };

    const StepIcon = STEPS[step].icon;

    return (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            </div>

            <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
                {/* Progress bar */}
                <div className="flex gap-2 mb-8">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-blue-500' : 'bg-slate-200'
                                }`}
                        />
                    ))}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <StepIcon className="w-8 h-8 text-blue-600" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">
                    {STEPS[step].title}
                </h2>

                {/* Step Content */}
                <div className="min-h-[200px] flex flex-col justify-center">
                    {step === 0 && (
                        <div className="text-center">
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                Your AI-powered health companion that helps you understand medical reports,
                                track nutrition, and stay healthy.
                            </p>
                            <div className="flex justify-center gap-3 flex-wrap">
                                {['📊 Reports', '🏃 Exercise', '🥗 Nutrition', '💬 AI Chat'].map(item => (
                                    <div key={item} className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-semibold text-slate-700">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full p-4 border-2 border-slate-200 rounded-xl text-lg focus:border-blue-500 focus:outline-none transition-colors text-center font-medium"
                            autoFocus
                        />
                    )}

                    {step === 2 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {CONDITIONS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => toggleItem(c, conditions, setConditions)}
                                    className={`px-4 py-2.5 rounded-full font-medium transition-all ${conditions.includes(c)
                                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {GOALS.map(g => (
                                <button
                                    key={g}
                                    onClick={() => toggleItem(g, goals, setGoals)}
                                    className={`px-4 py-2.5 rounded-full font-medium transition-all ${goals.includes(g)
                                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8">
                    {step > 0 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="text-slate-500 font-medium hover:text-slate-700 transition-colors"
                        >
                            ← Back
                        </button>
                    ) : (
                        <button
                            onClick={onComplete}
                            className="text-slate-400 text-sm hover:text-slate-600 transition-colors"
                        >
                            Skip for now
                        </button>
                    )}

                    <button
                        onClick={handleNext}
                        disabled={saving || (step === 1 && !name.trim())}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                {step === STEPS.length - 1 ? '🚀 Get Started' : 'Next'}
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
