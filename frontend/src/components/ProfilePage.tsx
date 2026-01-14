import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Edit2, LogOut, Shield, Save, X, Key, Trash2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

interface UserProfile {
    firstName: string;
    lastName: string;
    gender: string;
    dob: string;
    phone: string;
    bio: string;
    city: string;
}

const ProfilePage: React.FC = () => {
    const { user, signOut } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [profile, setProfile] = useState<UserProfile>({
        firstName: '',
        lastName: '',
        gender: '',
        dob: '',
        phone: '',
        bio: '',
        city: ''
    });

    // Load profile from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('hw_user_profile');
        if (saved) {
            setProfile(JSON.parse(saved));
        } else {
            // Initialize with email name
            const emailName = user?.email?.split('@')[0] || '';
            setProfile(prev => ({
                ...prev,
                firstName: emailName.charAt(0).toUpperCase() + emailName.slice(1)
            }));
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        // Save to localStorage (can be upgraded to Supabase later)
        localStorage.setItem('hw_user_profile', JSON.stringify(profile));

        // Simulate save delay
        await new Promise(resolve => setTimeout(resolve, 500));

        setIsSaving(false);
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleChange = (field: keyof UserProfile, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const displayName = profile.firstName && profile.lastName
        ? `${profile.firstName} ${profile.lastName}`
        : profile.firstName || user?.email?.split('@')[0] || 'User';

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-24 right-6 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in z-50">
                    <Check className="w-5 h-5" />
                    Profile saved successfully!
                </div>
            )}

            {/* Section 1: User Identity Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {/* Profile Avatar */}
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{displayName}</h2>
                            <p className="text-slate-500 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {user?.email}
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                Member since {new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    {/* Edit/Sign Out Buttons */}
                    <div className="flex gap-2">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Account Status */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm font-medium text-emerald-700">Active Account</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                        <Shield className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700">Email Verified</span>
                    </div>
                </div>
            </div>

            {/* Section 2: Personal Information */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">First Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={profile.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Enter first name"
                            />
                        ) : (
                            <p className="p-3 bg-slate-50 rounded-xl text-slate-700">{profile.firstName || '-'}</p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Last Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={profile.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Enter last name"
                            />
                        ) : (
                            <p className="p-3 bg-slate-50 rounded-xl text-slate-700">{profile.lastName || '-'}</p>
                        )}
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Gender</label>
                        {isEditing ? (
                            <select
                                value={profile.gender}
                                onChange={(e) => handleChange('gender', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer-not">Prefer not to say</option>
                            </select>
                        ) : (
                            <p className="p-3 bg-slate-50 rounded-xl text-slate-700 capitalize">{profile.gender || '-'}</p>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Date of Birth</label>
                        {isEditing ? (
                            <input
                                type="date"
                                value={profile.dob}
                                onChange={(e) => handleChange('dob', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        ) : (
                            <p className="p-3 bg-slate-50 rounded-xl text-slate-700">
                                {profile.dob ? new Date(profile.dob).toLocaleDateString() : '-'}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Phone Number</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="+91 98765 43210"
                            />
                        ) : (
                            <p className="p-3 bg-slate-50 rounded-xl text-slate-700">{profile.phone || '-'}</p>
                        )}
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">City</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={profile.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Hyderabad"
                            />
                        ) : (
                            <p className="p-3 bg-slate-50 rounded-xl text-slate-700">{profile.city || '-'}</p>
                        )}
                    </div>
                </div>

                {/* Bio */}
                <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Bio</label>
                    {isEditing ? (
                        <textarea
                            value={profile.bio}
                            onChange={(e) => handleChange('bio', e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none h-24"
                            placeholder="Student, developer, fitness enthusiast..."
                        />
                    ) : (
                        <p className="p-3 bg-slate-50 rounded-xl text-slate-700 min-h-[72px]">{profile.bio || '-'}</p>
                    )}
                </div>

                {/* Save Button */}
                {isEditing && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="mt-6 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Section 3: Account Settings */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-500" />
                    Account Settings
                </h3>

                <div className="space-y-3">
                    {/* Change Password */}
                    <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Key className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-slate-900">Change Password</p>
                                <p className="text-sm text-slate-500">Update your account password</p>
                            </div>
                        </div>
                        <span className="text-slate-400 group-hover:text-slate-600">→</span>
                    </button>

                    {/* Sign Out */}
                    <button
                        onClick={signOut}
                        className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-red-700">Sign Out</p>
                                <p className="text-sm text-red-500">Log out of your account</p>
                            </div>
                        </div>
                        <span className="text-red-400 group-hover:text-red-600">→</span>
                    </button>

                    {/* Delete Account */}
                    <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-slate-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-slate-900">Delete Account</p>
                                <p className="text-sm text-slate-500">Permanently remove your account</p>
                            </div>
                        </div>
                        <span className="text-slate-400 group-hover:text-slate-600">→</span>
                    </button>
                </div>
            </div>

            {/* Section 4: Security Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    Security
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Login Method</p>
                        <p className="font-semibold text-slate-900">
                            {user?.app_metadata?.provider === 'google' ? '🔵 Google' : '📧 Email & Password'}
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Email Status</p>
                        <p className="font-semibold text-emerald-600 flex items-center gap-1">
                            <Check className="w-4 h-4" /> Verified
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Last Sign In</p>
                        <p className="font-semibold text-slate-900">
                            {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Just now'}
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Account ID</p>
                        <p className="font-mono text-sm text-slate-900 truncate">{user?.id?.slice(0, 12)}...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
