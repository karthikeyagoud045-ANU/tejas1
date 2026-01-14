import React, { useEffect, useState } from 'react';
import { syncService } from '../services/syncService';
import { FileText, Utensils, Dumbbell, Droplet, Clock } from 'lucide-react';
interface HealthEvent {
    id: string;
    event_type: string;
    data: any;
    created_at: string;
}
const HealthTimeline: React.FC = () => {
    const [events, setEvents] = useState<HealthEvent[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadEvents();
    }, []);
    const loadEvents = async () => {
        setLoading(true);
        const data = await syncService.getEvents();
        setEvents(data);
        setLoading(false);
    };
    const getIcon = (type: string) => {
        const icons: Record<string, any> = {
            report: FileText,
            meal: Utensils,
            exercise: Dumbbell,
            water: Droplet
        };
        return icons[type] || Clock;
    };
    const getColor = (type: string) => {
        const colors: Record<string, string> = {
            report: 'bg-purple-500',
            meal: 'bg-green-500',
            exercise: 'bg-orange-500',
            water: 'bg-blue-500'
        };
        return colors[type] || 'bg-slate-500';
    };
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const getEventSummary = (event: HealthEvent) => {
        const d = event.data;
        switch (event.event_type) {
            case 'meal': return `${d.name || 'Meal'} - ${d.calories || 0} cal`;
            case 'exercise': return `${d.minutes || 0} minutes completed`;
            case 'water': return `Drank ${d.glasses || 1} glass of water`;
            case 'report': return 'Medical report analyzed';
            default: return JSON.stringify(d);
        }
    };
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }
    if (events.length === 0) {
        return (
            <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">No events yet</h3>
                <p className="text-slate-500">Start logging meals, exercises, and water to see your timeline!</p>
            </div>
        );
    }
    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">📅 Your Health Timeline</h2>

            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
                {events.map(event => {
                    const Icon = getIcon(event.event_type);
                    return (
                        <div key={event.id} className="relative ml-6">
                            {/* Dot */}
                            <div className={`absolute -left-9 w-6 h-6 ${getColor(event.event_type)} rounded-full flex items-center justify-center shadow-lg`}>
                                <Icon className="w-3 h-3 text-white" />
                            </div>

                            {/* Card */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold capitalize text-slate-800">
                                        {event.event_type}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {formatDate(event.created_at)}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600">
                                    {getEventSummary(event)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export default HealthTimeline;