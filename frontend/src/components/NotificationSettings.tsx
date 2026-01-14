import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Droplet, Dumbbell, Utensils, Check, X } from 'lucide-react';
import { pushService } from '../services/pushService';

interface ReminderSetting {
    key: 'water' | 'exercise' | 'meal';
    icon: React.ElementType;
    label: string;
    color: string;
    bgColor: string;
}

const REMINDER_SETTINGS: ReminderSetting[] = [
    { key: 'water', icon: Droplet, label: 'Water Reminders', color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { key: 'exercise', icon: Dumbbell, label: 'Exercise Reminders', color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { key: 'meal', icon: Utensils, label: 'Meal Logging', color: 'text-green-500', bgColor: 'bg-green-50' }
];

const NotificationSettings: React.FC = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isLoading, setIsLoading] = useState(false);
    const [reminders, setReminders] = useState({
        water: true,
        exercise: true,
        meal: false
    });

    useEffect(() => {
        if (pushService.isSupported()) {
            setPermission(pushService.getPermission());
        }
    }, []);

    const handleEnable = async () => {
        setIsLoading(true);
        const granted = await pushService.requestPermission();
        setPermission(granted ? 'granted' : 'denied');

        if (granted) {
            await pushService.register();
            // Send a test notification
            setTimeout(() => {
                pushService.sendTestNotification();
            }, 500);
        }
        setIsLoading(false);
    };

    const handleTestNotification = () => {
        pushService.sendTestNotification();
    };

    const toggleReminder = (key: 'water' | 'exercise' | 'meal') => {
        setReminders(prev => {
            const newValue = !prev[key];
            // If enabling, schedule a demo reminder for 1 minute
            if (newValue) {
                pushService.scheduleReminder(key, 1);
            }
            return { ...prev, [key]: newValue };
        });
    };

    if (!pushService.isSupported()) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="text-center py-6">
                    <BellOff className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">
                        Notifications are not supported in this browser.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Notification Settings
            </h3>

            {permission !== 'granted' ? (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BellOff className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 mb-4">
                        Enable notifications to get health reminders
                    </p>

                    {permission === 'denied' ? (
                        <div className="text-amber-600 text-sm mb-4 p-3 bg-amber-50 rounded-lg">
                            Notifications are blocked. Please enable them in your browser settings.
                        </div>
                    ) : (
                        <button
                            onClick={handleEnable}
                            disabled={isLoading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 mx-auto"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enabling...
                                </>
                            ) : (
                                <>
                                    <Bell className="w-4 h-4" />
                                    Enable Notifications
                                </>
                            )}
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600 font-medium p-2 bg-emerald-50 rounded-lg">
                        <Check className="w-4 h-4" />
                        Notifications enabled
                    </div>

                    {/* Reminder toggles */}
                    <div className="space-y-3">
                        {REMINDER_SETTINGS.map(({ key, icon: Icon, label, color, bgColor }) => (
                            <div
                                key={key}
                                className={`flex items-center justify-between p-4 rounded-xl transition-colors ${reminders[key] ? bgColor : 'bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${reminders[key] ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                                        <Icon className={`w-5 h-5 ${reminders[key] ? color : 'text-slate-400'}`} />
                                    </div>
                                    <span className={`font-medium ${reminders[key] ? 'text-slate-900' : 'text-slate-500'}`}>
                                        {label}
                                    </span>
                                </div>
                                <button
                                    onClick={() => toggleReminder(key)}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${reminders[key] ? 'bg-blue-500' : 'bg-slate-300'
                                        }`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${reminders[key] ? 'left-6' : 'left-1'
                                        }`} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleTestNotification}
                        className="w-full py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors border border-blue-100"
                    >
                        🔔 Send Test Notification
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationSettings;
