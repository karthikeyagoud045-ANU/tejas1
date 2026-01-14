// Location Service - Geolocation and Doctor Search API
// Connects to local backend for real doctor data

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export interface UserLocation {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: string;
}

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

export interface DoctorSearchResult {
    success: boolean;
    specialty?: string;
    extractedSpecialty?: string;
    count: number;
    doctors: Doctor[];
}

/**
 * Get user's current location using browser Geolocation API
 */
export async function getCurrentLocation(): Promise<UserLocation | null> {
    if (!navigator.geolocation) {
        console.error('Geolocation not supported');
        return null;
    }

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString()
                });
            },
            (error) => {
                console.error('Geolocation error:', error.message);
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes cache
            }
        );
    });
}

/**
 * Save user location to backend
 */
export async function saveLocation(userId: string, location: UserLocation): Promise<boolean> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/location/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                latitude: location.latitude,
                longitude: location.longitude
            })
        });

        return response.ok;
    } catch (error) {
        console.error('Failed to save location:', error);
        return false;
    }
}

/**
 * Get saved location for user
 */
export async function getSavedLocation(userId: string): Promise<UserLocation | null> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/location/${userId}`);
        if (!response.ok) return null;

        const data = await response.json();
        return {
            latitude: data.location.lat,
            longitude: data.location.lng,
            timestamp: data.location.updatedAt
        };
    } catch (error) {
        console.error('Failed to get saved location:', error);
        return null;
    }
}

/**
 * Search doctors by specialty
 */
export async function searchDoctors(
    specialty: string,
    latitude: number,
    longitude: number,
    radius: number = 15000
): Promise<DoctorSearchResult> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/doctors/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                specialty,
                latitude,
                longitude,
                radius
            })
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Doctor search failed:', error);
        return { success: false, count: 0, doctors: [] };
    }
}

/**
 * Natural language doctor search
 * Automatically extracts specialty from query using AI
 */
export async function naturalSearch(
    query: string,
    latitude: number,
    longitude: number,
    radius: number = 15000
): Promise<DoctorSearchResult> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/doctors/natural-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query,
                latitude,
                longitude,
                radius
            })
        });

        if (!response.ok) {
            throw new Error('Natural search failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Natural search failed:', error);
        return { success: false, count: 0, doctors: [] };
    }
}

/**
 * Extract specialty from natural language query
 */
export async function extractSpecialty(query: string): Promise<string> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/doctors/extract-specialty`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        if (!response.ok) return 'general physician';

        const data = await response.json();
        return data.specialty || 'general physician';
    } catch (error) {
        console.error('Specialty extraction failed:', error);
        return 'general physician';
    }
}

/**
 * Get available specialties
 */
export async function getSpecialties(): Promise<Array<{ id: string; name: string }>> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/doctors/specialties`);
        if (!response.ok) return [];

        const data = await response.json();
        return data.specialties || [];
    } catch (error) {
        console.error('Failed to get specialties:', error);
        return [];
    }
}

/**
 * Get doctor details by place ID
 */
export async function getDoctorDetails(placeId: string): Promise<Partial<Doctor> | null> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/doctors/${placeId}`);
        if (!response.ok) return null;

        const data = await response.json();
        return data.doctor;
    } catch (error) {
        console.error('Failed to get doctor details:', error);
        return null;
    }
}

/**
 * Format distance for display
 */
export function formatDistance(km?: number): string {
    if (!km) return '';
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)} km`;
}

/**
 * Get location with fallback to default (Hyderabad, India)
 */
export async function getLocationWithFallback(): Promise<UserLocation> {
    const location = await getCurrentLocation();

    if (location) {
        return location;
    }

    // Default to Hyderabad, India
    console.log('Using default location: Hyderabad, India');
    return {
        latitude: 17.3850,
        longitude: 78.4867,
        timestamp: new Date().toISOString()
    };
}

export default {
    getCurrentLocation,
    saveLocation,
    getSavedLocation,
    searchDoctors,
    naturalSearch,
    extractSpecialty,
    getSpecialties,
    getDoctorDetails,
    formatDistance,
    getLocationWithFallback
};
