
import { Cabin, CabinStatus, CleaningChecklist, Guest, Issue, Log, Notification, Role, Stay, User, Priority } from "../types";
import { supabase } from "./supabaseClient";

/**
 * Enhanced error handler that classifies errors and manages reporting.
 */
const processError = (error: any, context: string): Error => {
    if (!error) return new Error('Unknown Error');

    const errorMsg = error.message || (typeof error === 'string' ? error : JSON.stringify(error));
    const errorCode = error.code || '';
    
    const isNetwork = 
        errorMsg.includes('NetworkError') || 
        errorMsg.includes('Failed to fetch') || 
        error.name === 'TypeError' ||
        errorCode === 'PGRST100' || 
        error.status === 0;

    // Detection for Missing Tables (42P01), Missing Columns (42703) or Schema Cache out of sync
    const isSchemaError = 
        errorCode === '42P01' || 
        errorCode === '42703' ||
        errorMsg.includes('does not exist') ||
        errorMsg.includes('column') && errorMsg.includes('not found') ||
        errorMsg.includes('relation') && errorMsg.includes('not found') ||
        errorMsg.includes('schema cache') || 
        errorMsg.includes('pending_cleaning_id');

    if (isSchemaError) {
        console.error(`Database Schema Missing [${context}]:`, errorMsg);
        return new Error('MISSING_TABLES');
    }

    if (!isNetwork) {
        console.error(`Supabase DB Error [${context}]:`, errorMsg, error);
    }

    if (errorMsg.includes('violates row-level security policy')) return new Error('RLS_ERROR');
    if (isNetwork) return new Error('NETWORK_ERROR');
    
    return new Error(errorMsg);
};

const safeQuery = async <T>(
    queryFn: () => Promise<{ data: T | null; error: any } | any>,
    context: string,
    retries = 2,
    delay = 800
): Promise<T | null> => {
    try {
        const result = await queryFn();
        if (result && 'error' in result && result.error) {
            const err = processError(result.error, context);
            if (err.message === 'NETWORK_ERROR' && retries > 0) {
                await new Promise(r => setTimeout(r, delay));
                return safeQuery(queryFn, context, retries - 1, delay * 2);
            }
            throw err;
        }
        return result && 'data' in result ? result.data : result;
    } catch (e: any) {
        const err = processError(e, context);
        if (err.message === 'NETWORK_ERROR' && retries > 0) {
            await new Promise(r => setTimeout(r, delay));
            return safeQuery(queryFn, context, retries - 1, delay * 2);
        }
        throw err;
    }
};

const mapGuest = (g: any): Guest => ({
    id: g.id,
    firstName: g.first_name,
    lastName: g.last_name,
    phone: g.phone,
    createdAt: g.created_at
});

const mapStay = (s: any): Stay => ({
    id: s.id,
    cabinId: s.cabin_id,
    guestId: s.guest_id,
    guestCount: s.guest_count,
    nights: s.nights,
    stayDate: s.stay_date,
    checkInDate: s.stay_date,
    checkOutDate: s.checkout_date,
    actualCheckoutAt: s.actual_checkout_at,
    createdBy: s.created_by,
    createdAt: s.created_at,
    isActive: s.is_active,
    guestName: s.guests ? `${s.guests.first_name} ${s.guests.last_name}` : 'نامشخص',
    guestPhone: s.guests?.phone || ''
});

export const MockDB = {
    async checkConnection() {
        await safeQuery(() => supabase.from('cabins').select('count', { count: 'exact', head: true }).limit(1), 'checkCabins');
    },

    async getCabins(): Promise<Cabin[]> {
        const data = await safeQuery<any[]>(() => supabase.from('cabins').select('*').order('name'), 'getCabins');
        return (data || []).map(c => ({
            id: c.id,
            name: c.name,
            status: c.status as CabinStatus,
            icon: c.icon,
            pendingCleaningId: c.pending_cleaning_id || undefined
        }));
    },

    async updateCabin(cabin: Partial<Cabin> & { id: string }) {
        const updateData: any = {};
        if (cabin.name !== undefined) updateData.name = cabin.name;
        if (cabin.status !== undefined) updateData.status = cabin.status;
        if (cabin.icon !== undefined) updateData.icon = cabin.icon;
        
        // Handle pending_cleaning_id explicitly
        if (cabin.pendingCleaningId !== undefined) {
            updateData.pending_cleaning_id = cabin.pendingCleaningId;
        } else if (cabin.status === CabinStatus.EMPTY_CLEAN) {
            // Automatically clear pending cleaning if status becomes clean
            updateData.pending_cleaning_id = null;
        }

        await safeQuery(() => supabase.from('cabins').update(updateData).eq('id', cabin.id), 'updateCabin');
    },

    async getUsers(): Promise<User[]> {
        const data = await safeQuery<any[]>(() => supabase.from('users').select('*'), 'getUsers');
        return (data || []).map(u => ({
            id: u.id,
            username: u.username,
            password: u.password,
            role: u.role as Role,
            createdAt: u.created_at,
            lastLogin: u.last_login
        }));
    },

    async saveUser(user: User) {
        await safeQuery(() => supabase.from('users').upsert({
            id: user.id,
            username: user.username,
            password: user.password,
            role: user.role
        }), 'saveUser');
    },

    async getGuests(): Promise<Guest[]> {
        const data = await safeQuery<any[]>(() => supabase.from('guests').select('*').order('created_at', { ascending: false }), 'getGuests');
        return (data || []).map(mapGuest);
    },

    async getGuestByPhone(phone: string): Promise<Guest | null> {
        const data = await safeQuery<any>(() => supabase.from('guests').select('*').eq('phone', phone).maybeSingle(), 'getGuestByPhone');
        return data ? mapGuest(data) : null;
    },

    async saveGuest(guest: Partial<Guest>): Promise<Guest> {
        const data = await safeQuery<any>(() => supabase.from('guests').upsert({
            first_name: guest.firstName,
            last_name: guest.lastName,
            phone: guest.phone
        }).select().single(), 'saveGuest');
        return mapGuest(data);
    },

    async getStays(): Promise<Stay[]> {
        const data = await safeQuery<any[]>(() => supabase.from('stays').select('*, guests(*)').order('created_at', { ascending: false }), 'getStays');
        return (data || []).map(mapStay);
    },

    async addStay(stay: Partial<Stay>) {
        await safeQuery(() => supabase.from('stays').insert({
            cabin_id: stay.cabinId,
            guest_id: stay.guestId,
            guest_count: stay.guestCount,
            nights: stay.nights,
            stay_date: stay.stayDate,
            checkout_date: stay.checkOutDate,
            created_by: stay.createdBy,
            is_active: true
        }), 'addStay');
    },

    async deleteStay(stayId: string) {
        await safeQuery(() => supabase.from('stays').delete().eq('id', stayId), 'deleteStay');
    },

    async deactivateStaysForCabin(cabinId: string) {
        await safeQuery(() => supabase.from('stays').update({ 
            is_active: false,
            actual_checkout_at: new Date().toISOString()
        }).eq('cabin_id', cabinId).eq('is_active', true), 'deactivateStaysForCabin');
    },

    async getIssues(): Promise<Issue[]> {
        const data = await safeQuery<any[]>(() => supabase.from('issues').select('*').order('created_at', { ascending: false }), 'getIssues');
        return (data || []).map(i => ({
            id: i.id,
            cabinId: i.cabin_id,
            title: i.title || 'بدون عنوان',
            type: i.type,
            priority: i.priority || Priority.MEDIUM,
            description: i.description,
            reportedBy: i.reported_by,
            reportedAt: i.created_at,
            status: i.status,
            resolvedAt: i.resolved_at
        }));
    },

    async saveIssue(issue: Issue) {
        await safeQuery(() => supabase.from('issues').upsert({
            id: issue.id,
            cabin_id: issue.cabinId,
            title: issue.title,
            type: issue.type,
            priority: issue.priority,
            description: issue.description,
            reported_by: issue.reportedBy,
            status: issue.status,
            resolved_at: issue.resolvedAt
        }), 'saveIssue');
    },

    async getLogs(): Promise<Log[]> {
        const data = await safeQuery<any[]>(() => supabase.from('logs').select('*').order('created_at', { ascending: false }).limit(100), 'getLogs');
        return (data || []).map(l => ({
            id: l.id,
            userId: l.user_id,
            username: l.username,
            action: l.action,
            details: l.details,
            timestamp: l.created_at
        }));
    },

    async addLog(log: Log) {
        try {
            await supabase.from('logs').insert({
                user_id: log.userId,
                username: log.username,
                action: log.action,
                details: log.details
            });
        } catch (e: any) {
            console.warn('Logging failed silently:', e.message);
        }
    },

    async getNotifications(): Promise<Notification[]> {
        return [];
    },

    async getChecklist(id: string): Promise<CleaningChecklist | null> {
        const data = await safeQuery<any>(() => supabase.from('checklists').select('*').eq('id', id).maybeSingle(), 'getChecklist');
        if (!data) return null;
        return {
            id: data.id,
            cabinId: data.cabin_id,
            items: data.items,
            filledBy: data.filled_by,
            approvedBy: data.approved_by,
            status: data.status,
            createdAt: data.created_at,
            approvedAt: data.approved_at
        };
    },

    async submitChecklist(cl: Partial<CleaningChecklist>) {
        const res = await safeQuery<any>(() => supabase.from('checklists').insert({
            cabin_id: cl.cabinId,
            items: cl.items,
            filled_by: cl.filledBy,
            status: 'SUBMITTED'
        }).select().single(), 'submitChecklist');
        
        // Link checklist to cabin
        if (res && res.id) {
            await this.updateCabin({ id: cl.cabinId!, pendingCleaningId: res.id });
        }
        return res;
    },

    async approveChecklist(id: string, operator: string) {
        await safeQuery(() => supabase.from('checklists').update({
            approved_by: operator,
            status: 'APPROVED',
            approved_at: new Date().toISOString()
        }).eq('id', id), 'approveChecklist');
    }
};
