// Doctor Service for HealthWise.AI
// Mock doctor data and appointment booking

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    location: string;
    phone: string;
    email: string;
    rating: number;
    reviewCount: number;
    experience: number;
    fee: number;
    image: string;
    availableSlots: string[];
    about: string;
}

export interface Appointment {
    id: string;
    doctorId: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    createdAt: string;
}

// Specialty options
export const SPECIALTIES = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Endocrinologist',
    'Gastroenterologist',
    'Neurologist',
    'Orthopedist',
    'Pediatrician',
    'Psychiatrist',
    'Gynecologist'
];

// Mock doctors data
const MOCK_DOCTORS: Doctor[] = [
    {
        id: 'doc_1',
        name: 'Dr. Sarah Johnson',
        specialty: 'General Physician',
        location: 'Downtown Medical Center',
        phone: '+1 (555) 123-4567',
        email: 'sarah.johnson@health.com',
        rating: 4.8,
        reviewCount: 245,
        experience: 12,
        fee: 75,
        image: '👩‍⚕️',
        availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        about: 'Experienced physician specializing in preventive care and chronic disease management.'
    },
    {
        id: 'doc_2',
        name: 'Dr. Michael Chen',
        specialty: 'Cardiologist',
        location: 'Heart Care Clinic',
        phone: '+1 (555) 234-5678',
        email: 'm.chen@heartcare.com',
        rating: 4.9,
        reviewCount: 189,
        experience: 15,
        fee: 150,
        image: '👨‍⚕️',
        availableSlots: ['10:00', '11:00', '14:00', '15:00'],
        about: 'Board-certified cardiologist with expertise in interventional cardiology.'
    },
    {
        id: 'doc_3',
        name: 'Dr. Emily Rodriguez',
        specialty: 'Endocrinologist',
        location: 'Diabetes & Hormone Center',
        phone: '+1 (555) 345-6789',
        email: 'e.rodriguez@dhc.com',
        rating: 4.7,
        reviewCount: 156,
        experience: 10,
        fee: 120,
        image: '👩‍⚕️',
        availableSlots: ['09:00', '10:00', '11:00', '15:00', '16:00'],
        about: 'Specializing in diabetes, thyroid disorders, and metabolic conditions.'
    },
    {
        id: 'doc_4',
        name: 'Dr. James Wilson',
        specialty: 'Dermatologist',
        location: 'Skin Health Clinic',
        phone: '+1 (555) 456-7890',
        email: 'j.wilson@skinhealth.com',
        rating: 4.6,
        reviewCount: 203,
        experience: 8,
        fee: 100,
        image: '👨‍⚕️',
        availableSlots: ['09:00', '11:00', '14:00', '16:00', '17:00'],
        about: 'Expert in medical and cosmetic dermatology with a focus on skin cancer prevention.'
    },
    {
        id: 'doc_5',
        name: 'Dr. Priya Patel',
        specialty: 'Pediatrician',
        location: 'Children\'s Health Center',
        phone: '+1 (555) 567-8901',
        email: 'p.patel@childrenshealth.com',
        rating: 4.9,
        reviewCount: 312,
        experience: 14,
        fee: 80,
        image: '👩‍⚕️',
        availableSlots: ['08:00', '09:00', '10:00', '14:00', '15:00'],
        about: 'Caring pediatrician dedicated to children\'s health and development.'
    },
    {
        id: 'doc_6',
        name: 'Dr. Robert Kim',
        specialty: 'Orthopedist',
        location: 'Joint & Spine Center',
        phone: '+1 (555) 678-9012',
        email: 'r.kim@jointspine.com',
        rating: 4.8,
        reviewCount: 178,
        experience: 18,
        fee: 140,
        image: '👨‍⚕️',
        availableSlots: ['10:00', '11:00', '14:00', '15:00', '16:00'],
        about: 'Orthopedic surgeon specializing in sports medicine and joint replacement.'
    }
];

class DoctorService {
    private appointments: Appointment[] = [];
    private storageKey = 'hw_appointments';

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) this.appointments = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load appointments:', e);
        }
    }

    private saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.appointments));
        } catch (e) {
            console.error('Failed to save appointments:', e);
        }
    }

    // Get all doctors
    getAllDoctors(): Doctor[] {
        return MOCK_DOCTORS;
    }

    // Search doctors
    searchDoctors(query: string, specialty?: string): Doctor[] {
        return MOCK_DOCTORS.filter(doc => {
            const matchesQuery = !query ||
                doc.name.toLowerCase().includes(query.toLowerCase()) ||
                doc.specialty.toLowerCase().includes(query.toLowerCase()) ||
                doc.location.toLowerCase().includes(query.toLowerCase());

            const matchesSpecialty = !specialty || specialty === 'All' || doc.specialty === specialty;

            return matchesQuery && matchesSpecialty;
        });
    }

    // Get doctor by ID
    getDoctorById(id: string): Doctor | undefined {
        return MOCK_DOCTORS.find(d => d.id === id);
    }

    // Get available slots for a doctor on a date
    getAvailableSlots(doctorId: string, date: string): string[] {
        const doctor = this.getDoctorById(doctorId);
        if (!doctor) return [];

        // Filter out already booked slots
        const bookedSlots = this.appointments
            .filter(a => a.doctorId === doctorId && a.date === date && a.status !== 'cancelled')
            .map(a => a.time);

        return doctor.availableSlots.filter(slot => !bookedSlots.includes(slot));
    }

    // Book appointment
    bookAppointment(doctorId: string, date: string, time: string, notes?: string): Appointment | null {
        const doctor = this.getDoctorById(doctorId);
        if (!doctor) return null;

        const availableSlots = this.getAvailableSlots(doctorId, date);
        if (!availableSlots.includes(time)) {
            throw new Error('This time slot is no longer available');
        }

        const appointment: Appointment = {
            id: `apt_${Date.now()}`,
            doctorId,
            doctorName: doctor.name,
            specialty: doctor.specialty,
            date,
            time,
            status: 'confirmed',
            notes,
            createdAt: new Date().toISOString()
        };

        this.appointments.push(appointment);
        this.saveToStorage();
        return appointment;
    }

    // Get user appointments
    getAppointments(): Appointment[] {
        return this.appointments
            .filter(a => a.status !== 'cancelled')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Get upcoming appointments
    getUpcomingAppointments(): Appointment[] {
        const today = new Date().toISOString().split('T')[0];
        return this.getAppointments()
            .filter(a => a.date >= today && a.status !== 'cancelled')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    // Cancel appointment
    cancelAppointment(id: string): boolean {
        const appointment = this.appointments.find(a => a.id === id);
        if (!appointment) return false;

        appointment.status = 'cancelled';
        this.saveToStorage();
        return true;
    }

    // Reschedule appointment
    rescheduleAppointment(id: string, newDate: string, newTime: string): Appointment | null {
        const appointment = this.appointments.find(a => a.id === id);
        if (!appointment) return null;

        const availableSlots = this.getAvailableSlots(appointment.doctorId, newDate);
        if (!availableSlots.includes(newTime)) {
            throw new Error('This time slot is not available');
        }

        appointment.date = newDate;
        appointment.time = newTime;
        this.saveToStorage();
        return appointment;
    }
}

export const doctorService = new DoctorService();
export default doctorService;
