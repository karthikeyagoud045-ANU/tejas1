import React, { useState, useEffect } from 'react';
import {
    Watch, Smartphone, RefreshCw, Link2, Link2Off,
    Heart, Footprints, Flame, Moon, Activity, TrendingUp
} from 'lucide-react';
import { wearableService, WearableDevice, HealthData } from '../services/wearableService';

const WearableConnect: React.FC = () => {
    const [devices, setDevices] = useState<WearableDevice[]>([]);
    const [connectedDevices, setConnectedDevices] = useState<WearableDevice[]>([]);
    const [healthData, setHealthData] = useState<HealthData | null>(null);
    const [connecting, setConnecting] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setDevices(wearableService.getAvailableDevices());
        setConnectedDevices(wearableService.getConnectedDevices());
        setHealthData(wearableService.getHealthData());
    };

    const handleConnect = async (deviceId: string) => {
        setConnecting(deviceId);
        try {
            await wearableService.connectDevice(deviceId);
            loadData();
        } catch (e) {
            console.error('Failed to connect:', e);
        }
        setConnecting(null);
    };

    const handleDisconnect = (deviceId: string) => {
        if (confirm('Disconnect this device?')) {
            wearableService.disconnectDevice(deviceId);
            loadData();
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        await wearableService.syncData();
        loadData();
        setSyncing(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">⌚ Wearable Devices</h2>
                    <p className="text-slate-500">Connect your fitness trackers and smartwatches</p>
                </div>
                {connectedDevices.length > 0 && (
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                )}
            </div>

            {/* Health Data Dashboard */}
            {healthData && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        Today's Activity
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Steps */}
                        <StatCard
                            icon={<Footprints className="w-6 h-6 text-blue-500" />}
                            label="Steps"
                            value={healthData.steps.toLocaleString()}
                            goal={healthData.stepsGoal.toLocaleString()}
                            progress={(healthData.steps / healthData.stepsGoal) * 100}
                            color="blue"
                        />

                        {/* Heart Rate */}
                        <StatCard
                            icon={<Heart className="w-6 h-6 text-red-500" />}
                            label="Heart Rate"
                            value={`${healthData.heartRate}`}
                            unit="bpm"
                            subtext={`${healthData.heartRateMin}-${healthData.heartRateMax}`}
                            color="red"
                        />

                        {/* Calories */}
                        <StatCard
                            icon={<Flame className="w-6 h-6 text-orange-500" />}
                            label="Calories"
                            value={healthData.calories.toLocaleString()}
                            goal={healthData.caloriesGoal.toLocaleString()}
                            progress={(healthData.calories / healthData.caloriesGoal) * 100}
                            color="orange"
                        />

                        {/* Sleep */}
                        <StatCard
                            icon={<Moon className="w-6 h-6 text-purple-500" />}
                            label="Sleep"
                            value={healthData.sleep.toFixed(1)}
                            unit="hrs"
                            goal={`${healthData.sleepGoal}h goal`}
                            progress={(healthData.sleep / healthData.sleepGoal) * 100}
                            color="purple"
                        />
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-200">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">{healthData.activeMinutes}</p>
                            <p className="text-sm text-slate-500">Active mins</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">{healthData.distance} km</p>
                            <p className="text-sm text-slate-500">Distance</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">{healthData.floors}</p>
                            <p className="text-sm text-slate-500">Floors</p>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 text-center mt-4">
                        Last updated: {wearableService.formatLastSync(healthData.lastUpdated)}
                    </p>
                </div>
            )}

            {/* Connected Devices */}
            {connectedDevices.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Link2 className="w-5 h-5 text-emerald-600" />
                        Connected Devices
                    </h3>
                    <div className="space-y-3">
                        {connectedDevices.map(device => (
                            <div key={device.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{device.icon}</span>
                                    <div>
                                        <p className="font-semibold text-slate-900">{device.name}</p>
                                        <p className="text-sm text-emerald-600">
                                            ✓ Connected • Last sync: {wearableService.formatLastSync(device.lastSync)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDisconnect(device.id)}
                                    className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium flex items-center gap-1"
                                >
                                    <Link2Off className="w-4 h-4" />
                                    Disconnect
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Available Devices */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-lg mb-4">
                    {connectedDevices.length > 0 ? 'Connect More Devices' : 'Connect a Device'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {devices.filter(d => !d.connected).map(device => (
                        <div key={device.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl">{device.icon}</span>
                                <div>
                                    <p className="font-semibold text-slate-900">{device.name}</p>
                                    <p className="text-sm text-slate-500">{device.brand}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleConnect(device.id)}
                                disabled={connecting === device.id}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {connecting === device.id ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Link2 className="w-4 h-4" />
                                        Connect
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                <p className="text-sm text-slate-400 mt-4 text-center">
                    * This is a demo with simulated data. Real integration requires OAuth setup.
                </p>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    unit?: string;
    goal?: string;
    subtext?: string;
    progress?: number;
    color: string;
}> = ({ icon, label, value, unit, goal, subtext, progress, color }) => {
    const colorConfig: Record<string, { bg: string; bar: string }> = {
        blue: { bg: 'bg-blue-100', bar: '#3B82F6' },
        red: { bg: 'bg-red-100', bar: '#EF4444' },
        orange: { bg: 'bg-orange-100', bar: '#F97316' },
        purple: { bg: 'bg-purple-100', bar: '#8B5CF6' }
    };

    const colorStyle = colorConfig[color] || colorConfig.blue;

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${colorStyle.bg}`}>
                    {icon}
                </div>
                <span className="text-sm font-medium text-slate-500">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{value}</span>
                {unit && <span className="text-slate-500 text-sm">{unit}</span>}
            </div>
            {goal && (
                <p className="text-xs text-slate-400 mt-1">of {goal} goal</p>
            )}
            {subtext && (
                <p className="text-xs text-slate-400 mt-1">{subtext}</p>
            )}
            {progress !== undefined && (
                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor: colorStyle.bar
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default WearableConnect;
