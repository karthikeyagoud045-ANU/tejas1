// Medication Service for HealthWise.AI
// Handles medication CRUD and reminder scheduling

import { supabase } from './supabaseClient';
import { pushService } from './pushService';

export interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: 'daily' | 'twice_daily' | 'weekly' | 'as_needed';
    times: string[];
    startDate: string;
    endDate?: string;
    notes?: string;
    active: boolean;
    color: string;
}

export interface MedicationLog {
    id: string;
    medicationId: string;
    takenAt: string;
    skipped: boolean;
}

// Color options for medications
export const MEDICATION_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
];

// Frequency options
export const FREQUENCY_OPTIONS = [
    { value: 'daily', label: 'Once daily' },
    { value: 'twice_daily', label: 'Twice daily' },
    { value: 'weekly', label: 'Once weekly' },
    { value: 'as_needed', label: 'As needed' },
];

class MedicationService {
    private medications: Medication[] = [];
    private logs: MedicationLog[] = [];
    private storageKey = 'hw_medications';
    private logsKey = 'hw_medication_logs';
    private reminderTimeouts: Map<string, number> = new Map();

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) this.medications = JSON.parse(saved);

            const savedLogs = localStorage.getItem(this.logsKey);
            if (savedLogs) this.logs = JSON.parse(savedLogs);
        } catch (e) {
            console.error('Failed to load medications:', e);
        }
    }

    private saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.medications));
            localStorage.setItem(this.logsKey, JSON.stringify(this.logs));
        } catch (e) {
            console.error('Failed to save medications:', e);
        }
    }

    // Get all medications
    getAll(): Medication[] {
        return this.medications.filter(m => m.active);
    }

    // Get medication by ID
    getById(id: string): Medication | undefined {
        return this.medications.find(m => m.id === id);
    }

    // Add new medication
    add(medication: Omit<Medication, 'id'>): Medication {
        const newMed: Medication = {
            ...medication,
            id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        this.medications.push(newMed);
        this.saveToStorage();
        this.scheduleReminders(newMed);
        return newMed;
    }

    // Update medication
    update(id: string, updates: Partial<Medication>): Medication | null {
        const index = this.medications.findIndex(m => m.id === id);
        if (index === -1) return null;

        this.medications[index] = { ...this.medications[index], ...updates };
        this.saveToStorage();

        // Reschedule reminders
        this.cancelReminders(id);
        if (this.medications[index].active) {
            this.scheduleReminders(this.medications[index]);
        }

        return this.medications[index];
    }

    // Delete medication (soft delete)
    delete(id: string): boolean {
        const med = this.getById(id);
        if (!med) return false;

        med.active = false;
        this.saveToStorage();
        this.cancelReminders(id);
        return true;
    }

    // Log medication taken
    logTaken(medicationId: string, skipped: boolean = false): MedicationLog {
        const log: MedicationLog = {
            id: `log_${Date.now()}`,
            medicationId,
            takenAt: new Date().toISOString(),
            skipped
        };
        this.logs.push(log);
        this.saveToStorage();
        return log;
    }

    // Get logs for a medication
    getLogs(medicationId: string, days: number = 7): MedicationLog[] {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return this.logs
            .filter(l => l.medicationId === medicationId && new Date(l.takenAt) > cutoff)
            .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
    }

    // Calculate adherence percentage
    getAdherence(medicationId: string, days: number = 7): number {
        const logs = this.getLogs(medicationId, days);
        const med = this.getById(medicationId);
        if (!med) return 0;

        const expectedDoses = this.getExpectedDoses(med, days);
        const takenDoses = logs.filter(l => !l.skipped).length;

        if (expectedDoses === 0) return 100;
        return Math.round((takenDoses / expectedDoses) * 100);
    }

    private getExpectedDoses(med: Medication, days: number): number {
        const dosesPerDay = med.frequency === 'twice_daily' ? 2 :
            med.frequency === 'weekly' ? 1 / 7 :
                med.frequency === 'as_needed' ? 0 : 1;
        return Math.round(dosesPerDay * days);
    }

    // Schedule reminders for a medication
    scheduleReminders(med: Medication): void {
        if (!med.times || med.times.length === 0) return;

        med.times.forEach((time, index) => {
            const [hours, minutes] = time.split(':').map(Number);
            const now = new Date();
            const reminderTime = new Date();
            reminderTime.setHours(hours, minutes, 0, 0);

            // If time has passed today, schedule for tomorrow
            if (reminderTime <= now) {
                reminderTime.setDate(reminderTime.getDate() + 1);
            }

            const delay = reminderTime.getTime() - now.getTime();

            const timeoutId = window.setTimeout(() => {
                pushService.sendLocalNotification(
                    `💊 ${med.name}`,
                    `Time to take your ${med.dosage} dose`
                );
                // Reschedule for next day
                this.scheduleReminders(med);
            }, delay);

            this.reminderTimeouts.set(`${med.id}_${index}`, timeoutId);
        });
    }

    // Cancel reminders for a medication
    cancelReminders(medicationId: string): void {
        this.reminderTimeouts.forEach((timeoutId, key) => {
            if (key.startsWith(medicationId)) {
                window.clearTimeout(timeoutId);
                this.reminderTimeouts.delete(key);
            }
        });
    }

    // Get today's schedule
    getTodaySchedule(): Array<{ medication: Medication; time: string; taken: boolean }> {
        const today = new Date().toDateString();
        const todayLogs = this.logs.filter(l => new Date(l.takenAt).toDateString() === today);

        const schedule: Array<{ medication: Medication; time: string; taken: boolean }> = [];

        this.getAll().forEach(med => {
            med.times.forEach(time => {
                const taken = todayLogs.some(l => l.medicationId === med.id && !l.skipped);
                schedule.push({ medication: med, time, taken });
            });
        });

        return schedule.sort((a, b) => a.time.localeCompare(b.time));
    }
}

export const medicationService = new MedicationService();
export default medicationService;
