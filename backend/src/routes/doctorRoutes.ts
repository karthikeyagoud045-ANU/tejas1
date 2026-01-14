// Doctor Routes - API endpoints for doctor search
// Includes location-based search and specialty extraction

import { Router, Request, Response } from 'express';
import doctorService from '../services/doctorService.js';

const router = Router();

// Store user locations (in-memory for demo, use Supabase in production)
const userLocations = new Map<string, { lat: number; lng: number; updatedAt: string }>();

/**
 * POST /api/doctors/search
 * Search for doctors by specialty and location
 */
router.post('/doctors/search', async (req: Request, res: Response) => {
    try {
        const { specialty, latitude, longitude, radius = 15000 } = req.body;

        if (!specialty) {
            return res.status(400).json({ error: 'Specialty is required' });
        }

        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Location (latitude, longitude) is required' });
        }

        console.log(`Searching for ${specialty} near ${latitude}, ${longitude}`);

        const doctors = await doctorService.searchDoctors({
            specialty,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radius: parseInt(radius)
        });

        res.json({
            success: true,
            specialty,
            count: doctors.length,
            doctors
        });

    } catch (error) {
        console.error('Doctor search error:', error);
        res.status(500).json({ error: 'Doctor search failed' });
    }
});

/**
 * POST /api/doctors/natural-search
 * Natural language search - extracts specialty using AI
 */
router.post('/doctors/natural-search', async (req: Request, res: Response) => {
    try {
        const { query, latitude, longitude, radius = 15000 } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Location is required' });
        }

        console.log(`Natural search: "${query}" near ${latitude}, ${longitude}`);

        // Step 1: Extract specialty from natural language
        const specialty = await doctorService.extractSpecialty(query);
        console.log(`Extracted specialty: ${specialty}`);

        // Step 2: Search for doctors
        const doctors = await doctorService.searchDoctors({
            specialty,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radius: parseInt(radius)
        });

        // Step 3: Format results (optional AI enhancement)
        const formattedDoctors = await doctorService.formatDoctorResults(doctors, specialty);

        res.json({
            success: true,
            query,
            extractedSpecialty: specialty,
            count: formattedDoctors.length,
            doctors: formattedDoctors
        });

    } catch (error) {
        console.error('Natural search error:', error);
        res.status(500).json({ error: 'Doctor search failed' });
    }
});

/**
 * GET /api/doctors/specialties
 * Get list of available specialties
 * NOTE: This must be BEFORE :placeId route to avoid matching "specialties" as a placeId
 */
router.get('/doctors/specialties', (_req: Request, res: Response) => {
    const specialties = Object.keys(doctorService.SPECIALTY_KEYWORDS).map(key => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        keywords: doctorService.SPECIALTY_KEYWORDS[key]
    }));

    res.json({
        success: true,
        specialties
    });
});

/**
 * GET /api/doctors/:placeId
 * Get detailed information about a specific doctor/hospital
 */
router.get('/doctors/:placeId', async (req: Request, res: Response) => {
    try {
        const { placeId } = req.params;

        if (!placeId) {
            return res.status(400).json({ error: 'Place ID is required' });
        }

        const details = await doctorService.getDoctorDetails(placeId);

        if (!details) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        res.json({
            success: true,
            doctor: details
        });

    } catch (error) {
        console.error('Doctor details error:', error);
        res.status(500).json({ error: 'Failed to get doctor details' });
    }
});

/**
 * POST /api/doctors/extract-specialty
 * Extract specialty from natural language (for chatbot integration)
 */
router.post('/doctors/extract-specialty', async (req: Request, res: Response) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const specialty = await doctorService.extractSpecialty(query);

        res.json({
            success: true,
            query,
            specialty
        });

    } catch (error) {
        console.error('Specialty extraction error:', error);
        res.status(500).json({ error: 'Extraction failed' });
    }
});

/**
 * POST /api/location/save
 * Save user's location
 */
router.post('/location/save', (req: Request, res: Response) => {
    try {
        const { userId, latitude, longitude } = req.body;

        if (!userId || !latitude || !longitude) {
            return res.status(400).json({ error: 'userId, latitude, and longitude are required' });
        }

        userLocations.set(userId, {
            lat: parseFloat(latitude),
            lng: parseFloat(longitude),
            updatedAt: new Date().toISOString()
        });

        console.log(`Location saved for user ${userId}: ${latitude}, ${longitude}`);

        res.json({
            success: true,
            message: 'Location saved successfully'
        });

    } catch (error) {
        console.error('Location save error:', error);
        res.status(500).json({ error: 'Failed to save location' });
    }
});

/**
 * GET /api/location/:userId
 * Get user's saved location
 */
router.get('/location/:userId', (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const location = userLocations.get(userId);

        if (!location) {
            return res.status(404).json({ error: 'Location not found for user' });
        }

        res.json({
            success: true,
            location
        });

    } catch (error) {
        console.error('Location get error:', error);
        res.status(500).json({ error: 'Failed to get location' });
    }
});

// Specialties route moved above :placeId route to avoid conflicts

export default router;
