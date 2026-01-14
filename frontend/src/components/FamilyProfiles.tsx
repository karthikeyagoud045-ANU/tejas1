import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Edit2, Trash2, Check, X, Copy, RefreshCw,
    LogOut, UserPlus, Share2
} from 'lucide-react';
import {
    familyService,
    FamilyMember,
    FamilyGroup,
    AVATARS,
    RELATIONSHIPS,
    COMMON_CONDITIONS
} from '../services/familyService';

interface FamilyProfilesProps {
    onProfileChange?: (member: FamilyMember) => void;
}

const FamilyProfiles: React.FC<FamilyProfilesProps> = ({ onProfileChange }) => {
    const [members, setMembers] = useState<FamilyMember[]>([]);
    const [familyGroup, setFamilyGroup] = useState<FamilyGroup | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
    const [activeProfile, setActiveProfile] = useState<FamilyMember | null>(null);
    const [codeCopied, setCodeCopied] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setMembers(familyService.getAll());
        setActiveProfile(familyService.getActive());
        setFamilyGroup(familyService.getFamilyGroup());
    };

    const handleCreateFamily = async () => {
        const group = await familyService.createFamilyGroup('My Family');
        setFamilyGroup(group);
    };

    const handleCopyCode = () => {
        if (familyGroup?.inviteCode) {
            navigator.clipboard.writeText(familyGroup.inviteCode);
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        }
    };

    const handleRegenerateCode = async () => {
        const newCode = await familyService.regenerateInviteCode();
        if (newCode && familyGroup) {
            setFamilyGroup({ ...familyGroup, inviteCode: newCode });
        }
    };

    const handleAddMember = (member: Omit<FamilyMember, 'id' | 'createdAt'>) => {
        try {
            familyService.add(member);
            loadData();
            setShowAddModal(false);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleUpdateMember = (id: string, updates: Partial<FamilyMember>) => {
        familyService.update(id, updates);
        loadData();
        setEditingMember(null);
    };

    const handleDeleteMember = (id: string) => {
        if (confirm('Remove this family member?')) {
            familyService.delete(id);
            loadData();
        }
    };

    const handleSwitchProfile = (id: string) => {
        const member = familyService.switchProfile(id);
        if (member) {
            setActiveProfile(member);
            onProfileChange?.(member);
        }
    };

    const handleLeaveFamily = async () => {
        if (confirm('Leave this family group?')) {
            await familyService.leaveFamilyGroup();
            setFamilyGroup(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">👨‍👩‍👧‍👦 Family Profiles</h2>
                    <p className="text-slate-500">Manage health for your whole family</p>
                </div>
                <div className="flex gap-2">
                    {!familyGroup && (
                        <>
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-medium flex items-center gap-2 hover:bg-purple-200 transition-colors"
                            >
                                <UserPlus className="w-4 h-4" /> Join Family
                            </button>
                            <button
                                onClick={handleCreateFamily}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Create Family
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Family Group Card with Invite Code */}
            {familyGroup && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold mb-1">{familyGroup.name}</h3>
                            <p className="text-blue-100 text-sm">Share the code below to invite family members</p>
                        </div>
                        <button
                            onClick={handleLeaveFamily}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            title="Leave Family"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Invite Code Display */}
                    <div className="mt-4 bg-white/20 backdrop-blur rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-100 uppercase tracking-wider mb-1">Invite Code</p>
                                <p className="text-3xl font-mono font-bold tracking-widest">{familyGroup.inviteCode}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopyCode}
                                    className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center gap-2"
                                >
                                    {codeCopied ? (
                                        <>
                                            <Check className="w-5 h-5" />
                                            <span className="text-sm font-medium">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-5 h-5" />
                                            <span className="text-sm font-medium">Copy</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleRegenerateCode}
                                    className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                                    title="Generate New Code"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Share Options */}
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => {
                                const text = `Join my family on HealthWise.AI! Use code: ${familyGroup.inviteCode}`;
                                if (navigator.share) {
                                    navigator.share({ title: 'Join My Family', text });
                                } else {
                                    navigator.clipboard.writeText(text);
                                    alert('Invite message copied!');
                                }
                            }}
                            className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <Share2 className="w-4 h-4" /> Share Invite
                        </button>
                    </div>
                </div>
            )}

            {/* Active Profile Banner */}
            {activeProfile && (
                <div
                    className="p-6 rounded-2xl border-2 transition-all"
                    style={{
                        borderColor: familyService.getProfileColor(activeProfile.relationship),
                        backgroundColor: `${familyService.getProfileColor(activeProfile.relationship)}10`
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div className="text-5xl">{activeProfile.avatar}</div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-slate-900">{activeProfile.name}</h3>
                                <span
                                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                    style={{ backgroundColor: familyService.getProfileColor(activeProfile.relationship) }}
                                >
                                    Active
                                </span>
                                {activeProfile.role && (
                                    <span
                                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                                        style={{
                                            backgroundColor: familyService.getRoleBadge(activeProfile.role).color + '20',
                                            color: familyService.getRoleBadge(activeProfile.role).color
                                        }}
                                    >
                                        {familyService.getRoleBadge(activeProfile.role).label}
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-500">
                                {activeProfile.age} years • {activeProfile.gender === 'M' ? 'Male' : activeProfile.gender === 'F' ? 'Female' : 'Other'}
                            </p>
                            {activeProfile.conditions.length > 0 && (
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {activeProfile.conditions.map(c => (
                                        <span key={c} className="px-2 py-1 bg-white/50 rounded-lg text-xs font-medium text-slate-600">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Family Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map(member => (
                    <MemberCard
                        key={member.id}
                        member={member}
                        isActive={member.id === activeProfile?.id}
                        onSelect={() => handleSwitchProfile(member.id)}
                        onEdit={() => setEditingMember(member)}
                        onDelete={() => handleDeleteMember(member.id)}
                    />
                ))}

                {/* Add Member Card */}
                {members.length < 10 && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-2 min-h-[160px]"
                    >
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                            <Plus className="w-6 h-6 text-slate-400" />
                        </div>
                        <span className="text-slate-500 font-medium">Add Family Member</span>
                        <span className="text-xs text-slate-400">{10 - members.length} slots remaining</span>
                    </button>
                )}
            </div>

            {/* Add/Edit Modal */}
            {(showAddModal || editingMember) && (
                <MemberModal
                    member={editingMember}
                    onSave={editingMember
                        ? (updates) => handleUpdateMember(editingMember.id, updates)
                        : handleAddMember
                    }
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingMember(null);
                    }}
                />
            )}

            {/* Join Family Modal */}
            {showJoinModal && (
                <JoinFamilyModal
                    onJoin={async (code) => {
                        const result = await familyService.joinFamilyByCode(code);
                        if (result.success) {
                            setFamilyGroup(result.group || null);
                            setShowJoinModal(false);
                        }
                        return result;
                    }}
                    onClose={() => setShowJoinModal(false)}
                />
            )}
        </div>
    );
};

// Member Card Component
const MemberCard: React.FC<{
    member: FamilyMember;
    isActive: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ member, isActive, onSelect, onEdit, onDelete }) => {
    const profileColor = familyService.getProfileColor(member.relationship);
    const roleBadge = familyService.getRoleBadge(member.role);

    return (
        <div
            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${isActive ? 'ring-2 ring-offset-2' : ''}`}
            style={{
                borderColor: isActive ? profileColor : '#E2E8F0',
                ...(isActive ? { '--tw-ring-color': profileColor } as any : {})
            }}
            onClick={onSelect}
        >
            {isActive && (
                <div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: profileColor }}
                >
                    <Check className="w-3 h-3 text-white" />
                </div>
            )}

            <div className="flex items-start gap-4">
                <div className="text-4xl">{member.avatar}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 truncate">{member.name}</h4>
                        {member.role && (
                            <span
                                className="text-xs px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: roleBadge.color + '20', color: roleBadge.color }}
                            >
                                {member.role === 'owner' ? '👑' : ''}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500">
                        {RELATIONSHIPS.find(r => r.value === member.relationship)?.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        {member.age} years • {member.gender}
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <Edit2 className="w-4 h-4 text-slate-400" />
                </button>
                {member.relationship !== 'self' && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                )}
            </div>
        </div>
    );
};

// Join Family Modal
const JoinFamilyModal: React.FC<{
    onJoin: (code: string) => Promise<{ success: boolean; message: string }>;
    onClose: () => void;
}> = ({ onJoin, onClose }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        const result = await onJoin(code);
        setLoading(false);
        if (!result.success) {
            setError(result.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
                <h3 className="text-xl font-bold mb-2">Join Family</h3>
                <p className="text-slate-500 text-sm mb-6">Enter the 6-character invite code shared by your family member</p>

                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="w-full p-4 text-center text-2xl font-mono font-bold tracking-widest border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    maxLength={6}
                    inputMode="numeric"
                />

                {error && (
                    <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
                )}

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={code.length !== 6 || loading}
                        className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50"
                    >
                        {loading ? 'Joining...' : 'Join Family'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Add/Edit Modal Component
const MemberModal: React.FC<{
    member: FamilyMember | null;
    onSave: (data: any) => void;
    onClose: () => void;
}> = ({ member, onSave, onClose }) => {
    const [name, setName] = useState(member?.name || '');
    const [relationship, setRelationship] = useState<any>(member?.relationship || 'other');
    const [age, setAge] = useState(member?.age?.toString() || '30');
    const [gender, setGender] = useState<'M' | 'F' | 'Other'>(member?.gender || 'Other');
    const [conditions, setConditions] = useState<string[]>(member?.conditions || []);
    const [avatar, setAvatar] = useState(member?.avatar || '👤');

    const toggleCondition = (condition: string) => {
        setConditions(prev =>
            prev.includes(condition)
                ? prev.filter(c => c !== condition)
                : [...prev.filter(c => c !== 'None'), condition === 'None' ? 'None' : condition].filter(Boolean)
        );
    };

    const handleSubmit = () => {
        if (!name.trim()) return;

        onSave({
            name,
            relationship,
            age: parseInt(age) || 30,
            gender,
            conditions: conditions.filter(c => c !== 'None'),
            avatar,
            isActive: member?.isActive || false,
            role: member?.role || 'member'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">
                    {member ? 'Edit Member' : 'Add Family Member'}
                </h3>

                <div className="space-y-4">
                    {/* Avatar Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Choose Avatar
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {AVATARS.map(a => (
                                <button
                                    key={a}
                                    onClick={() => setAvatar(a)}
                                    className={`text-3xl p-2 rounded-xl transition-all ${avatar === a ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-slate-100'}`}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., John"
                            className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Relationship */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
                        <select
                            value={relationship}
                            onChange={(e) => setRelationship(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        >
                            {RELATIONSHIPS.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Age & Gender */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                min="0"
                                max="120"
                                className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value as any)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            >
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Health Conditions */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Health Conditions</label>
                        <div className="flex gap-2 flex-wrap">
                            {COMMON_CONDITIONS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => toggleCondition(c)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${conditions.includes(c)
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                        className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
                    >
                        {member ? 'Update' : 'Add'} Member
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FamilyProfiles;
