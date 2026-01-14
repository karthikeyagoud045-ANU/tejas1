// Enhanced Family Profiles Service for HealthWise.AI
// Supports 6-digit invite codes and per-member authentication

import { supabase } from './supabaseClient';

export interface FamilyMember {
    id: string;
    name: string;
    relationship: 'self' | 'spouse' | 'child' | 'parent' | 'other';
    age: number;
    gender: 'M' | 'F' | 'Other';
    conditions: string[];
    avatar: string;
    isActive: boolean;
    createdAt: string;
    userId?: string; // Supabase user ID if authenticated
    role?: 'owner' | 'admin' | 'member';
}

export interface FamilyGroup {
    id: string;
    name: string;
    inviteCode: string;
    ownerId: string;
    createdAt: string;
    memberCount: number;
}

// Avatar options
export const AVATARS = [
    '👤', '👩', '👨', '👧', '👦', '👴', '👵', '🧑', '👶'
];

// Relationship options
export const RELATIONSHIPS = [
    { value: 'self', label: 'Myself' },
    { value: 'spouse', label: 'Spouse/Partner' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'other', label: 'Other' },
];

// Common conditions
export const COMMON_CONDITIONS = [
    'Diabetes', 'Hypertension', 'Heart Disease', 'Thyroid',
    'Asthma', 'Arthritis', 'Pregnancy', 'None'
];

class FamilyService {
    private members: FamilyMember[] = [];
    private familyGroup: FamilyGroup | null = null;
    private storageKey = 'hw_family_members';
    private groupKey = 'hw_family_group';

    constructor() {
        this.loadFromStorage();
        this.initDefaultProfile();
    }

    // ==================== INVITE CODE SYSTEM ====================

    /**
     * Generate a unique 6-digit numeric invite code
     */
    generateInviteCode(): string {
        // Generate 6 random digits (100000 - 999999)
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        return code;
    }

    /**
     * Create a new family group (current user becomes owner)
     */
    async createFamilyGroup(name: string = 'My Family'): Promise<FamilyGroup> {
        const inviteCode = this.generateInviteCode();

        const group: FamilyGroup = {
            id: `grp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            inviteCode,
            ownerId: 'local', // Will be replaced with Supabase user ID when auth'd
            createdAt: new Date().toISOString(),
            memberCount: 1
        };

        // Try to save to Supabase if available
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                group.ownerId = user.id;
                await supabase.from('family_groups').insert({
                    id: group.id,
                    name: group.name,
                    invite_code: group.inviteCode,
                    owner_id: user.id
                });
            }
        } catch (e) {
            console.log('Saving family group locally');
        }

        this.familyGroup = group;
        this.saveGroupToStorage();

        // Mark first member as owner
        if (this.members.length > 0) {
            this.members[0].role = 'owner';
            this.saveToStorage();
        }

        return group;
    }

    /**
     * Join an existing family using invite code
     */
    async joinFamilyByCode(code: string): Promise<{ success: boolean; message: string; group?: FamilyGroup }> {
        const normalizedCode = code.toUpperCase().trim();

        if (normalizedCode.length !== 6) {
            return { success: false, message: 'Invalid code format. Please enter a 6-character code.' };
        }

        // Try Supabase first
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Look up group by invite code
                const { data: groupData, error } = await supabase
                    .from('family_groups')
                    .select('*')
                    .eq('invite_code', normalizedCode)
                    .single();

                if (error || !groupData) {
                    return { success: false, message: 'Invalid invite code. Please check and try again.' };
                }

                // Check if already a member
                const { data: existing } = await supabase
                    .from('family_memberships')
                    .select('id')
                    .eq('family_id', groupData.id)
                    .eq('user_id', user.id)
                    .single();

                if (existing) {
                    return { success: false, message: 'You are already a member of this family.' };
                }

                // Add membership
                await supabase.from('family_memberships').insert({
                    family_id: groupData.id,
                    user_id: user.id,
                    role: 'member'
                });

                const group: FamilyGroup = {
                    id: groupData.id,
                    name: groupData.name,
                    inviteCode: groupData.invite_code,
                    ownerId: groupData.owner_id,
                    createdAt: groupData.created_at,
                    memberCount: 0
                };

                this.familyGroup = group;
                this.saveGroupToStorage();

                return { success: true, message: 'Successfully joined family!', group };
            }
        } catch (e) {
            console.log('Supabase not available, using local storage');
        }

        // Local fallback - check stored groups
        const storedGroups = localStorage.getItem('hw_all_family_groups');
        if (storedGroups) {
            const groups: FamilyGroup[] = JSON.parse(storedGroups);
            const found = groups.find(g => g.inviteCode === normalizedCode);
            if (found) {
                this.familyGroup = found;
                this.saveGroupToStorage();
                return { success: true, message: 'Successfully joined family!', group: found };
            }
        }

        return { success: false, message: 'Invalid invite code. Please check and try again.' };
    }

    /**
     * Get current family group
     */
    getFamilyGroup(): FamilyGroup | null {
        return this.familyGroup;
    }

    /**
     * Leave current family group
     */
    async leaveFamilyGroup(): Promise<boolean> {
        if (!this.familyGroup) return false;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && this.familyGroup.ownerId !== user.id) {
                await supabase.from('family_memberships')
                    .delete()
                    .eq('family_id', this.familyGroup.id)
                    .eq('user_id', user.id);
            }
        } catch (e) {
            console.log('Using local storage');
        }

        this.familyGroup = null;
        localStorage.removeItem(this.groupKey);
        return true;
    }

    /**
     * Regenerate invite code (owner only)
     */
    async regenerateInviteCode(): Promise<string | null> {
        if (!this.familyGroup) return null;

        const newCode = this.generateInviteCode();
        this.familyGroup.inviteCode = newCode;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && this.familyGroup.ownerId === user.id) {
                await supabase.from('family_groups')
                    .update({ invite_code: newCode })
                    .eq('id', this.familyGroup.id);
            }
        } catch (e) {
            console.log('Saving locally');
        }

        this.saveGroupToStorage();
        return newCode;
    }

    // ==================== STORAGE ====================

    private loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) this.members = JSON.parse(saved);

            const savedGroup = localStorage.getItem(this.groupKey);
            if (savedGroup) this.familyGroup = JSON.parse(savedGroup);
        } catch (e) {
            console.error('Failed to load family data:', e);
        }
    }

    private saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.members));
        } catch (e) {
            console.error('Failed to save family members:', e);
        }
    }

    private saveGroupToStorage() {
        try {
            if (this.familyGroup) {
                localStorage.setItem(this.groupKey, JSON.stringify(this.familyGroup));

                // Also save to all groups for code lookup
                const allGroups = localStorage.getItem('hw_all_family_groups');
                const groups: FamilyGroup[] = allGroups ? JSON.parse(allGroups) : [];
                const existing = groups.findIndex(g => g.id === this.familyGroup!.id);
                if (existing >= 0) {
                    groups[existing] = this.familyGroup;
                } else {
                    groups.push(this.familyGroup);
                }
                localStorage.setItem('hw_all_family_groups', JSON.stringify(groups));
            }
        } catch (e) {
            console.error('Failed to save family group:', e);
        }
    }

    private initDefaultProfile() {
        if (this.members.length === 0) {
            this.add({
                name: 'Me',
                relationship: 'self',
                age: 30,
                gender: 'Other',
                conditions: [],
                avatar: '👤',
                isActive: true,
                role: 'owner'
            });
        }
    }

    // ==================== MEMBER MANAGEMENT ====================

    getAll(): FamilyMember[] {
        return this.members;
    }

    getActive(): FamilyMember | null {
        return this.members.find(m => m.isActive) || this.members[0] || null;
    }

    getById(id: string): FamilyMember | undefined {
        return this.members.find(m => m.id === id);
    }

    add(member: Omit<FamilyMember, 'id' | 'createdAt'>): FamilyMember {
        if (this.members.length >= 10) {
            throw new Error('Maximum 10 family members allowed');
        }

        const newMember: FamilyMember = {
            ...member,
            id: `fam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            role: member.role || 'member'
        };

        if (this.members.length === 0 || member.isActive) {
            this.members.forEach(m => m.isActive = false);
            newMember.isActive = true;
        }

        this.members.push(newMember);
        this.saveToStorage();
        return newMember;
    }

    update(id: string, updates: Partial<FamilyMember>): FamilyMember | null {
        const index = this.members.findIndex(m => m.id === id);
        if (index === -1) return null;

        this.members[index] = { ...this.members[index], ...updates };
        this.saveToStorage();
        return this.members[index];
    }

    delete(id: string): boolean {
        const index = this.members.findIndex(m => m.id === id);
        if (index === -1) return false;

        const wasActive = this.members[index].isActive;
        this.members.splice(index, 1);

        if (wasActive && this.members.length > 0) {
            this.members[0].isActive = true;
        }

        this.saveToStorage();
        return true;
    }

    switchProfile(id: string): FamilyMember | null {
        const member = this.getById(id);
        if (!member) return null;

        this.members.forEach(m => m.isActive = m.id === id);
        this.saveToStorage();

        window.dispatchEvent(new CustomEvent('profileChanged', { detail: member }));
        return member;
    }

    getProfileColor(relationship: string): string {
        const colors: Record<string, string> = {
            self: '#3B82F6',
            spouse: '#EC4899',
            child: '#10B981',
            parent: '#8B5CF6',
            other: '#F59E0B'
        };
        return colors[relationship] || colors.other;
    }

    getRoleBadge(role?: string): { label: string; color: string } {
        const badges: Record<string, { label: string; color: string }> = {
            owner: { label: '👑 Owner', color: '#F59E0B' },
            admin: { label: '⭐ Admin', color: '#8B5CF6' },
            member: { label: '👤 Member', color: '#6B7280' }
        };
        return badges[role || 'member'] || badges.member;
    }
}

export const familyService = new FamilyService();
export default familyService;
