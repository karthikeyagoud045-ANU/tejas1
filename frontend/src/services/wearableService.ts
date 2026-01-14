// Wearable Integration Service for HealthWise.AI
// Mock data for wearable device integration

export interface WearableDevice {
    id: string;
    name: string;
    type: 'watch' | 'band' | 'ring' | 'phone';
    brand: string;
    icon: string;
    connected: boolean;
    lastSync?: string;
}

export interface HealthData {
    steps: number;
    stepsGoal: number;
    heartRate: number;
    heartRateMin: number;
    heartRateMax: number;
    calories: number;
    caloriesGoal: number;
    sleep: number;
    sleepGoal: number;
    activeMinutes: number;
    activeGoal: number;
    distance: number;
    floors: number;
    lastUpdated: string;
}

// Available devices to connect
export const AVAILABLE_DEVICES: WearableDevice[] = [
    { id: 'apple_watch', name: 'Apple Watch', type: 'watch', brand: 'Apple', icon: '⌚', connected: false },
    { id: 'fitbit', name: 'Fitbit', type: 'band', brand: 'Fitbit', icon: '📱', connected: false },
    { id: 'samsung_galaxy', name: 'Galaxy Watch', type: 'watch', brand: 'Samsung', icon: '⌚', connected: false },
    { id: 'garmin', name: 'Garmin', type: 'watch', brand: 'Garmin', icon: '⌚', connected: false },
    { id: 'oura', name: 'Oura Ring', type: 'ring', brand: 'Oura', icon: '💍', connected: false },
    { id: 'google_fit', name: 'Google Fit', type: 'phone', brand: 'Google', icon: '📱', connected: false },
    { id: 'apple_health', name: 'Apple Health', type: 'phone', brand: 'Apple', icon: '❤️', connected: false },
];

// Generate mock health data based on time of day
const generateMockData = (): HealthData => {
    const hour = new Date().getHours();
    const progressFactor = Math.min(hour / 24, 1);

    return {
        steps: Math.floor(8000 * progressFactor + Math.random() * 2000),
        stepsGoal: 10000,
        heartRate: Math.floor(60 + Math.random() * 40),
        heartRateMin: 55 + Math.floor(Math.random() * 10),
        heartRateMax: 120 + Math.floor(Math.random() * 30),
        calories: Math.floor(1500 * progressFactor + Math.random() * 500),
        caloriesGoal: 2000,
        sleep: 6.5 + Math.random() * 2,
        sleepGoal: 8,
        activeMinutes: Math.floor(30 * progressFactor + Math.random() * 30),
        activeGoal: 60,
        distance: parseFloat((5 * progressFactor + Math.random() * 2).toFixed(1)),
        floors: Math.floor(8 * progressFactor + Math.random() * 5),
        lastUpdated: new Date().toISOString()
    };
};

class WearableService {
    private connectedDevices: WearableDevice[] = [];
    private healthData: HealthData | null = null;
    private storageKey = 'hw_wearable_devices';

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.connectedDevices = JSON.parse(saved);
                if (this.connectedDevices.length > 0) {
                    this.healthData = generateMockData();
                }
            }
        } catch (e) {
            console.error('Failed to load wearable data:', e);
        }
    }

    private saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.connectedDevices));
        } catch (e) {
            console.error('Failed to save wearable data:', e);
        }
    }

    // Get available devices
    getAvailableDevices(): WearableDevice[] {
        return AVAILABLE_DEVICES.map(device => ({
            ...device,
            connected: this.connectedDevices.some(d => d.id === device.id)
        }));
    }

    // Get connected devices
    getConnectedDevices(): WearableDevice[] {
        return this.connectedDevices;
    }

    // Connect device (mock - simulates OAuth flow)
    async connectDevice(deviceId: string): Promise<boolean> {
        const device = AVAILABLE_DEVICES.find(d => d.id === deviceId);
        if (!device) return false;

        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Add to connected devices
        const connectedDevice: WearableDevice = {
            ...device,
            connected: true,
            lastSync: new Date().toISOString()
        };

        if (!this.connectedDevices.some(d => d.id === deviceId)) {
            this.connectedDevices.push(connectedDevice);
        }

        // Generate mock health data
        this.healthData = generateMockData();
        this.saveToStorage();

        return true;
    }

    // Disconnect device
    disconnectDevice(deviceId: string): boolean {
        const index = this.connectedDevices.findIndex(d => d.id === deviceId);
        if (index === -1) return false;

        this.connectedDevices.splice(index, 1);

        if (this.connectedDevices.length === 0) {
            this.healthData = null;
        }

        this.saveToStorage();
        return true;
    }

    // Get health data
    getHealthData(): HealthData | null {
        if (this.connectedDevices.length === 0) return null;

        // Refresh mock data
        this.healthData = generateMockData();
        return this.healthData;
    }

    // Sync data from devices (mock)
    async syncData(): Promise<HealthData | null> {
        if (this.connectedDevices.length === 0) return null;

        // Simulate sync delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update connected devices last sync time
        this.connectedDevices.forEach(d => {
            d.lastSync = new Date().toISOString();
        });

        this.healthData = generateMockData();
        this.saveToStorage();

        return this.healthData;
    }

    // Check if any device is connected
    hasConnectedDevice(): boolean {
        return this.connectedDevices.length > 0;
    }

    // Format last sync time
    formatLastSync(dateString?: string): string {
        if (!dateString) return 'Never';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

        return date.toLocaleDateString();
    }
}

export const wearableService = new WearableService();
export default wearableService;
