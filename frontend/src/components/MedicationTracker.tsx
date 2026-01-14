import React, { useState, useEffect } from 'react';
import {
    Pill, Plus, Clock, Check, X, Edit2, Trash2,
    Bell, Calendar, ChevronRight, BarChart2
} from 'lucide-react';
import {
    medicationService,
    Medication,
    MEDICATION_COLORS,
    FREQUENCY_OPTIONS
} from '../services/medicationService';

const MedicationTracker: React.FC = () => {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMed, setEditingMed] = useState<Medication | null>(null);
    const [todaySchedule, setTodaySchedule] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setMedications(medicationService.getAll());
        setTodaySchedule(medicationService.getTodaySchedule());
    };

    const handleAddMedication = (med: Omit<Medication, 'id'>) => {
        medicationService.add(med);
        loadData();
        setShowAddModal(false);
    };

    const handleUpdateMedication = (id: string, updates: Partial<Medication>) => {
        medicationService.update(id, updates);
        loadData();
        setEditingMed(null);
    };

    const handleDeleteMedication = (id: string) => {
        if (confirm('Delete this medication?')) {
            medicationService.delete(id);
            loadData();
        }
    };

    const handleLogTaken = (medicationId: string, skipped: boolean = false) => {
        medicationService.logTaken(medicationId, skipped);
        loadData();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">💊 Medications</h2>
                    <p className="text-slate-500">Track your medications and never miss a dose</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Medication
                </button>
            </div>

            {/* Today's Schedule */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Today's Schedule
                </h3>

                {todaySchedule.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No medications scheduled for today</p>
                ) : (
                    <div className="space-y-3">
                        {todaySchedule.map((item, index) => (
                            <div
                                key={`${item.medication.id}-${index}`}
                                className={`flex items-center justify-between p-4 rounded-xl transition-all ${item.taken
                                    ? 'bg-emerald-50 border border-emerald-200'
                                    : 'bg-white border border-slate-200'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.medication.color }}
                                    />
                                    <div>
                                        <p className="font-semibold text-slate-900">{item.medication.name}</p>
                                        <p className="text-sm text-slate-500">{item.medication.dosage}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-slate-600">{item.time}</span>
                                    {item.taken ? (
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Taken
                                        </span>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleLogTaken(item.medication.id)}
                                                className="px-3 py-1 bg-emerald-500 text-white rounded-full text-sm font-medium hover:bg-emerald-600"
                                            >
                                                Take
                                            </button>
                                            <button
                                                onClick={() => handleLogTaken(item.medication.id, true)}
                                                className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-300"
                                            >
                                                Skip
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Medication List */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-lg mb-4">All Medications</h3>

                {medications.length === 0 ? (
                    <div className="text-center py-8">
                        <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No medications added yet</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-3 text-blue-600 font-medium hover:underline"
                        >
                            Add your first medication
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {medications.map(med => (
                            <MedicationCard
                                key={med.id}
                                medication={med}
                                adherence={medicationService.getAdherence(med.id)}
                                onEdit={() => setEditingMed(med)}
                                onDelete={() => handleDeleteMedication(med.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {(showAddModal || editingMed) && (
                <MedicationModal
                    medication={editingMed}
                    onSave={editingMed
                        ? (updates) => handleUpdateMedication(editingMed.id, updates)
                        : handleAddMedication
                    }
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingMed(null);
                    }}
                />
            )}
        </div>
    );
};

// Medication Card Component with Enhanced Adherence Display
const MedicationCard: React.FC<{
    medication: Medication;
    adherence: number;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ medication, adherence, onEdit, onDelete }) => {
    // Calculate doses taken for display
    const logs = medicationService.getLogs(medication.id, 7);
    const takenDoses = logs.filter(l => !l.skipped).length;
    const expectedDoses = medication.frequency === 'twice_daily' ? 14 :
        medication.frequency === 'weekly' ? 1 :
            medication.frequency === 'as_needed' ? 0 : 7;

    // Get previous week's adherence for trend
    const previousWeekLogs = medicationService.getLogs(medication.id, 14).filter(l => {
        const logDate = new Date(l.takenAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        return logDate >= twoWeeksAgo && logDate < weekAgo;
    });
    const previousTakenDoses = previousWeekLogs.filter(l => !l.skipped).length;
    const previousAdherence = expectedDoses > 0 ? Math.round((previousTakenDoses / expectedDoses) * 100) : 100;
    const trend = adherence - previousAdherence;

    return (
        <div className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${medication.color}20` }}
                    >
                        <Pill className="w-6 h-6" style={{ color: medication.color }} />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900">{medication.name}</p>
                        <p className="text-sm text-slate-500">
                            {medication.dosage} • {FREQUENCY_OPTIONS.find(f => f.value === medication.frequency)?.label}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-400">{medication.times.join(', ')}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                        <Edit2 className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                </div>
            </div>

            {/* Enhanced Adherence Display */}
            {medication.frequency !== 'as_needed' && (
                <div className="mt-4 p-3 bg-white rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                            📊 This Week
                        </span>
                        {trend !== 0 && (
                            <span className={`text-xs font-bold flex items-center gap-1 ${trend > 0 ? 'text-emerald-600' : 'text-red-500'
                                }`}>
                                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
                            </span>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div
                            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${adherence >= 80 ? 'bg-emerald-500' :
                                    adherence >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${Math.min(adherence, 100)}%` }}
                        />
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">
                            {takenDoses} of {expectedDoses} doses taken
                        </span>
                        <span className={`text-lg font-bold ${adherence >= 80 ? 'text-emerald-600' :
                                adherence >= 50 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                            {adherence}%
                        </span>
                    </div>
                </div>
            )}

            {/* As Needed Badge */}
            {medication.frequency === 'as_needed' && (
                <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-sm text-blue-700 font-medium">
                        💡 Take as needed — {logs.length} doses logged this week
                    </span>
                </div>
            )}
        </div>
    );
};

// Add/Edit Modal Component
const MedicationModal: React.FC<{
    medication: Medication | null;
    onSave: (data: any) => void;
    onClose: () => void;
}> = ({ medication, onSave, onClose }) => {
    const [name, setName] = useState(medication?.name || '');
    const [dosage, setDosage] = useState(medication?.dosage || '');
    const [frequency, setFrequency] = useState(medication?.frequency || 'daily');
    const [times, setTimes] = useState<string[]>(medication?.times || ['09:00']);
    const [color, setColor] = useState(medication?.color || MEDICATION_COLORS[0]);
    const [notes, setNotes] = useState(medication?.notes || '');

    const handleSubmit = () => {
        if (!name.trim()) return;

        onSave({
            name,
            dosage,
            frequency,
            times,
            color,
            notes,
            startDate: new Date().toISOString().split('T')[0],
            active: true
        });
    };

    const addTime = () => setTimes([...times, '12:00']);
    const removeTime = (index: number) => setTimes(times.filter((_, i) => i !== index));
    const updateTime = (index: number, value: string) => {
        const newTimes = [...times];
        newTimes[index] = value;
        setTimes(newTimes);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
                <h3 className="text-xl font-bold mb-4">
                    {medication ? 'Edit Medication' : 'Add Medication'}
                </h3>

                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Medication Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Metformin"
                            className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Dosage */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Dosage
                        </label>
                        <input
                            type="text"
                            value={dosage}
                            onChange={(e) => setDosage(e.target.value)}
                            placeholder="e.g., 500mg"
                            className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Frequency */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Frequency
                        </label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value as any)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        >
                            {FREQUENCY_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Times */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Reminder Times
                        </label>
                        <div className="space-y-2">
                            {times.map((time, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => updateTime(index, e.target.value)}
                                        className="flex-1 p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                    />
                                    {times.length > 1 && (
                                        <button
                                            onClick={() => removeTime(index)}
                                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={addTime}
                                className="text-blue-600 text-sm font-medium flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add another time
                            </button>
                        </div>
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Color
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {MEDICATION_COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-offset-2 ring-blue-500' : ''
                                        }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Take with food"
                            className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none h-20"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                        className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
                    >
                        {medication ? 'Update' : 'Add'} Medication
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicationTracker;
