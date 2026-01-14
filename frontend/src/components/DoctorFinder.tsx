import React, { useState, useEffect } from 'react';
import {
    MapPin, Star, Clock, Phone, Navigation,
    Loader2, AlertCircle, Building2, PhoneCall, GraduationCap, IndianRupee
} from 'lucide-react';
import { HYDERABAD_DOCTORS, HYDERABAD_AREAS, DOCTOR_SPECIALTIES, HyderabadDoctor } from '../data/hyderabadDoctors';

const DoctorFinder: React.FC = () => {
    const [doctors, setDoctors] = useState<HyderabadDoctor[]>([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [selectedArea, setSelectedArea] = useState('All Areas');
    const [hasSearched, setHasSearched] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Filter doctors based on specialty and area
    const handleSearch = () => {
        if (!selectedSpecialty) {
            setDoctors([]);
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);

        // Simulate brief loading for UX
        setTimeout(() => {
            let filtered = HYDERABAD_DOCTORS.filter(
                doc => doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase()
            );

            if (selectedArea !== 'All Areas') {
                filtered = filtered.filter(doc => doc.area === selectedArea);
            }

            // Sort by rating (highest first)
            filtered.sort((a, b) => b.rating - a.rating);

            setDoctors(filtered);
            setIsSearching(false);
        }, 300);
    };

    // Auto-search when filters change
    useEffect(() => {
        if (selectedSpecialty) {
            handleSearch();
        }
    }, [selectedSpecialty, selectedArea]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">🩺 Find a Doctor</h2>
                    <p className="text-slate-500">150+ verified doctors in Hyderabad</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                    <Navigation className="w-4 h-4" />
                    Hyderabad
                </div>
            </div>

            {/* Search Controls */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Specialty Dropdown */}
                    <div className="w-full md:w-72">
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                            Specialty
                        </label>
                        <select
                            value={selectedSpecialty}
                            onChange={(e) => setSelectedSpecialty(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white text-slate-800 font-medium"
                        >
                            <option value="">Select a specialty...</option>
                            {DOCTOR_SPECIALTIES.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>

                    {/* Area Dropdown */}
                    <div className="w-full md:w-64">
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                            Area
                        </label>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-slate-400" />
                            <select
                                value={selectedArea}
                                onChange={(e) => setSelectedArea(e.target.value)}
                                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white text-slate-800 font-medium"
                            >
                                {HYDERABAD_AREAS.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Results */}
            {isSearching ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-slate-500">Finding doctors...</span>
                </div>
            ) : hasSearched ? (
                <>
                    {/* Results Count */}
                    <div className="text-sm text-slate-500">
                        Found {doctors.length} {selectedSpecialty} doctor{doctors.length !== 1 ? 's' : ''}
                        {selectedArea !== 'All Areas' ? ` in ${selectedArea}` : ' in Hyderabad'}
                    </div>

                    {doctors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {doctors.map(doctor => (
                                <DoctorCard key={doctor.id} doctor={doctor} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl">
                            <p className="text-slate-500">No doctors found</p>
                            <p className="text-sm text-slate-400 mt-2">Try selecting "All Areas" or a different specialty</p>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                    <div className="text-5xl mb-4">👨‍⚕️</div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Select a Specialty</h3>
                    <p className="text-slate-500">
                        Choose a specialty above to find doctors in Hyderabad
                    </p>
                </div>
            )}
        </div>
    );
};

// Doctor Card Component with full details
const DoctorCard: React.FC<{ doctor: HyderabadDoctor }> = ({ doctor }) => {
    const handleCall = () => {
        window.location.href = `tel:${doctor.phone}`;
    };

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex gap-4">
                <div className="text-4xl">👨‍⚕️</div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{doctor.name}</h4>
                    <p className="text-blue-600 font-medium text-sm">{doctor.specialty}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">{doctor.rating}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span className="text-sm text-slate-500">{doctor.experience} yrs exp</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-sm text-green-600 font-medium">{doctor.timing}</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
                {/* Hospital */}
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                    <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-blue-800">{doctor.hospital}</span>
                </div>

                {/* Area/Location */}
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{doctor.area}, Hyderabad</span>
                </div>

                {/* Qualification */}
                <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{doctor.qualification}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-blue-600">{doctor.phone}</span>
                </div>

                {/* Fee & Languages */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        <span className="font-semibold text-slate-700">₹{doctor.fee}</span>
                        <span>consultation</span>
                    </div>
                    <span>{doctor.languages}</span>
                </div>
            </div>

            {/* Call Button */}
            <div className="mt-4">
                <button
                    onClick={handleCall}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                    <PhoneCall className="w-5 h-5" />
                    Call Now
                </button>
            </div>
        </div>
    );
};

export default DoctorFinder;
