// Push Notification Service for HealthWise.AI

export const pushService = {
    // Check if push notifications are supported
    isSupported(): boolean {
        return 'Notification' in window && 'serviceWorker' in navigator;
    },

    // Get current permission status
    getPermission(): NotificationPermission {
        if (!this.isSupported()) return 'denied';
        return Notification.permission;
    },

    // Request notification permission
    async requestPermission(): Promise<boolean> {
        if (!this.isSupported()) {
            console.log('Notifications not supported');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Permission request failed:', error);
            return false;
        }
    },

    // Register service worker
    async register(): Promise<ServiceWorkerRegistration | null> {
        if (!('serviceWorker' in navigator)) {
            console.log('Service Worker not supported');
            return null;
        }

        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered:', registration.scope);
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return null;
        }
    },

    // Send a local notification (works without service worker)
    async sendLocalNotification(title: string, body: string, options: NotificationOptions = {}): Promise<boolean> {
        if (!this.isSupported()) return false;

        if (Notification.permission !== 'granted') {
            const allowed = await this.requestPermission();
            if (!allowed) return false;
        }

        try {
            new Notification(title, {
                body,
                icon: '/icon-192.png',
                badge: '/icon-72.png',
                ...options
            });
            return true;
        } catch (error) {
            console.error('Notification failed:', error);
            return false;
        }
    },

    // Pre-defined health reminders
    reminders: {
        water: {
            title: '💧 Water Reminder',
            body: 'Time to drink a glass of water! Stay hydrated.'
        },
        exercise: {
            title: '🏃 Exercise Time',
            body: 'Take a 5-minute stretch break! Your body will thank you.'
        },
        meal: {
            title: '🥗 Meal Time',
            body: "Don't forget to log your meal in HealthWise!"
        },
        medication: {
            title: '💊 Medication Reminder',
            body: 'Time to take your medication.'
        }
    },

    // Schedule a reminder (using setTimeout - for demo purposes)
    scheduleReminder(
        type: 'water' | 'exercise' | 'meal' | 'medication',
        delayMinutes: number = 60
    ): number {
        const reminder = this.reminders[type];

        const timeoutId = window.setTimeout(() => {
            this.sendLocalNotification(reminder.title, reminder.body);
        }, delayMinutes * 60 * 1000);

        console.log(`⏰ Reminder scheduled: ${type} in ${delayMinutes} minutes`);
        return timeoutId;
    },

    // Cancel a scheduled reminder
    cancelReminder(timeoutId: number): void {
        window.clearTimeout(timeoutId);
        console.log('Reminder cancelled');
    },

    // Send test notification
    async sendTestNotification(): Promise<boolean> {
        return this.sendLocalNotification(
            '✅ Notifications Working!',
            'You will receive health reminders from HealthWise.AI'
        );
    }
};

export default pushService;
