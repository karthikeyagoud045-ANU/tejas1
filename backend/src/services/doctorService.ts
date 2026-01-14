// Doctor Service - Real Doctor Search via Google Places API
// Integrates with Ollama for specialty extraction and result formatting
// Falls back to OpenRouter/Gemini when Ollama is unavailable

import ollamaService, { getOllamaStatus } from './ollamaService.js';
import fallbackService from './fallbackService.js';

// Google Places API Key (should be in env vars)
const GOOGLE_PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

export interface Doctor {
    id: string;
    name: string;
    specialization: string;
    rating: number;
    totalRatings: number;
    address: string;
    phone?: string;
    distance?: number;
    hospital?: string;
    photoUrl?: string;
    openNow?: boolean;
    placeId: string;
}

export interface SearchParams {
    specialty: string;
    latitude: number;
    longitude: number;
    radius?: number; // in meters, default 15000 (15km)
}

// Specialty mapping for better search results
const SPECIALTY_KEYWORDS: Record<string, string[]> = {
    'dermatologist': ['dermatologist', 'skin doctor', 'skin specialist'],
    'cardiologist': ['cardiologist', 'heart doctor', 'heart specialist'],
    'orthopedist': ['orthopedic', 'bone doctor', 'orthopedist'],
    'pediatrician': ['pediatrician', 'child doctor', 'kids doctor'],
    'gynecologist': ['gynecologist', 'obgyn', 'women doctor'],
    'neurologist': ['neurologist', 'brain doctor', 'neuro specialist'],
    'psychiatrist': ['psychiatrist', 'mental health doctor'],
    'dentist': ['dentist', 'dental doctor', 'teeth doctor'],
    'ophthalmologist': ['ophthalmologist', 'eye doctor', 'eye specialist'],
    'ent': ['ent', 'ear nose throat', 'ent specialist'],
    'general physician': ['general physician', 'family doctor', 'gp'],
    'pulmonologist': ['pulmonologist', 'lung doctor', 'chest specialist'],
    'gastroenterologist': ['gastroenterologist', 'stomach doctor', 'gi doctor'],
    'endocrinologist': ['endocrinologist', 'diabetes doctor', 'hormone specialist'],
    'urologist': ['urologist', 'kidney doctor'],
    'oncologist': ['oncologist', 'cancer doctor', 'cancer specialist']
};

/**
 * Extract specialty from natural language query
 * Uses Ollama first, falls back to OpenRouter/Gemini
 */
export async function extractSpecialty(userQuery: string): Promise<string> {
    const prompt = `Extract the medical speciality from this user message.

Examples:
"best skin doctors near me" → dermatologist
"heart doctor nearby" → cardiologist
"lung specialist" → pulmonologist
"I need a doctor for my child" → pediatrician
"eye checkup needed" → ophthalmologist
"stomach pain specialist" → gastroenterologist

User message: "${userQuery}"

Return ONLY a JSON object:
{ "speciality": "..." }

If no specialty found, return:
{ "speciality": "general physician" }`;

    const messages = [
        { role: 'system' as const, content: 'You are a medical specialty extractor. Return only valid JSON.' },
        { role: 'user' as const, content: prompt }
    ];

    try {
        // Try Ollama first
        const ollamaStatus = await getOllamaStatus();

        let responseText: string;
        let source: string;

        if (ollamaStatus.running && ollamaStatus.model) {
            console.log('Using Ollama for specialty extraction');
            const response = await ollamaService.chat(messages);
            responseText = response.message;
            source = 'ollama';
        } else {
            // Fallback to cloud APIs (OpenRouter/Gemini)
            console.log('Ollama unavailable, using cloud fallback for specialty extraction');
            const response = await fallbackService.fallbackChat(messages);
            responseText = response.message;
            source = response.model;
        }

        console.log(`Specialty extraction via ${source}`);

        // Parse the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.speciality || 'general physician';
        }
        return 'general physician';
    } catch (error) {
        console.error('Specialty extraction failed with all providers:', error);

        // Last resort: simple keyword matching
        const lowerQuery = userQuery.toLowerCase();
        for (const [specialty, keywords] of Object.entries(SPECIALTY_KEYWORDS)) {
            if (keywords.some(kw => lowerQuery.includes(kw))) {
                return specialty;
            }
        }
        return 'general physician';
    }
}

/**
 * Search for doctors using Google Places API
 */
export async function searchDoctors(params: SearchParams): Promise<Doctor[]> {
    const { specialty, latitude, longitude, radius = 15000 } = params;

    if (!GOOGLE_PLACES_KEY) {
        console.warn('Google Places API key not configured, returning mock data');
        return getMockDoctors(specialty, latitude, longitude);
    }

    try {
        const keyword = encodeURIComponent(`${specialty} doctor hospital clinic`);
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=${keyword}&location=${latitude},${longitude}&radius=${radius}&type=doctor|hospital|health&key=${GOOGLE_PLACES_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error('Google Places API error:', data.status, data.error_message);
            return getMockDoctors(specialty, latitude, longitude);
        }

        const doctors: Doctor[] = (data.results || []).map((place: any) => ({
            id: place.place_id,
            name: place.name,
            specialization: specialty,
            rating: place.rating || 0,
            totalRatings: place.user_ratings_total || 0,
            address: place.vicinity || place.formatted_address || '',
            hospital: place.name,
            openNow: place.opening_hours?.open_now,
            placeId: place.place_id,
            photoUrl: place.photos?.[0]?.photo_reference
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_KEY}`
                : undefined,
            distance: calculateDistance(latitude, longitude, place.geometry?.location?.lat, place.geometry?.location?.lng)
        }));

        // Sort by rating (highest first), then by distance
        return doctors.sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return (a.distance || 999) - (b.distance || 999);
        });

    } catch (error) {
        console.error('Doctor search failed:', error);
        return getMockDoctors(specialty, latitude, longitude);
    }
}

/**
 * Get doctor details including phone number
 */
export async function getDoctorDetails(placeId: string): Promise<Partial<Doctor> | null> {
    if (!GOOGLE_PLACES_KEY) {
        return null;
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_phone_number,formatted_address,rating,reviews,opening_hours,website&key=${GOOGLE_PLACES_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
            return null;
        }

        return {
            name: data.result.name,
            phone: data.result.formatted_phone_number,
            address: data.result.formatted_address,
            rating: data.result.rating
        };
    } catch (error) {
        console.error('Doctor details fetch failed:', error);
        return null;
    }
}

/**
 * Format doctor results using AI for clean output
 * Uses Ollama first, falls back to OpenRouter/Gemini
 */
export async function formatDoctorResults(doctors: Doctor[], specialty: string): Promise<Doctor[]> {
    if (doctors.length === 0) return [];

    const prompt = `You receive raw doctor data. Clean and format it.

Raw data:
${JSON.stringify(doctors.slice(0, 10), null, 2)}

Rules:
1. Keep only doctors relevant to "${specialty}"
2. Sort by highest rating first
3. Remove entries with rating = 0
4. Keep the same JSON structure

Return as JSON array only.`;

    const messages = [
        { role: 'system' as const, content: 'You are a data formatter. Return only valid JSON arrays.' },
        { role: 'user' as const, content: prompt }
    ];

    try {
        const ollamaStatus = await getOllamaStatus();
        let responseText: string;

        if (ollamaStatus.running && ollamaStatus.model) {
            const response = await ollamaService.chat(messages);
            responseText = response.message;
        } else {
            const response = await fallbackService.fallbackChat(messages);
            responseText = response.message;
        }

        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        console.error('Doctor formatting failed, returning raw:', error);
    }

    return doctors;
}

/**
 * Calculate distance between two coordinates in km
 */
function calculateDistance(lat1: number, lon1: number, lat2?: number, lon2?: number): number {
    if (!lat2 || !lon2) return 0;

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

/**
 * Mock doctors for development/demo when API key not available
 */
function getMockDoctors(specialty: string, lat: number, lng: number): Doctor[] {
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return [
        {
            id: 'mock_1',
            name: `Dr. Sarah Johnson`,
            specialization: capitalize(specialty),
            rating: 4.9,
            totalRatings: 234,
            address: '123 Medical Center Drive',
            phone: '+91 98765 43210',
            distance: 1.2,
            hospital: 'Apollo Hospital',
            openNow: true,
            placeId: 'mock_1'
        },
        {
            id: 'mock_2',
            name: `Dr. Rajesh Kumar`,
            specialization: capitalize(specialty),
            rating: 4.7,
            totalRatings: 189,
            address: '456 Healthcare Plaza',
            phone: '+91 98765 43211',
            distance: 2.5,
            hospital: 'Max Healthcare',
            openNow: true,
            placeId: 'mock_2'
        },
        {
            id: 'mock_3',
            name: `Dr. Priya Sharma`,
            specialization: capitalize(specialty),
            rating: 4.6,
            totalRatings: 156,
            address: '789 Wellness Street',
            phone: '+91 98765 43212',
            distance: 3.8,
            hospital: 'Fortis Hospital',
            openNow: false,
            placeId: 'mock_3'
        },
        {
            id: 'mock_4',
            name: `Dr. Michael Chen`,
            specialization: capitalize(specialty),
            rating: 4.5,
            totalRatings: 142,
            address: '321 Care Avenue',
            phone: '+91 98765 43213',
            distance: 5.2,
            hospital: 'Medanta Hospital',
            openNow: true,
            placeId: 'mock_4'
        },
        {
            id: 'mock_5',
            name: `Dr. Anita Reddy`,
            specialization: capitalize(specialty),
            rating: 4.4,
            totalRatings: 98,
            address: '654 Health Road',
            phone: '+91 98765 43214',
            distance: 6.7,
            hospital: 'KIMS Hospital',
            openNow: true,
            placeId: 'mock_5'
        }
    ];
}

export default {
    extractSpecialty,
    searchDoctors,
    getDoctorDetails,
    formatDoctorResults,
    SPECIALTY_KEYWORDS
};
