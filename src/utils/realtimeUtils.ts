import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Debounce function to prevent excessive updates
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Merge a realtime INSERT event into an array
 */
export function mergeRealtimeInsert<T extends { id: string }>(
    currentList: T[],
    payload: RealtimePostgresChangesPayload<T>
): T[] {
    if (payload.eventType !== 'INSERT') return currentList;

    const newItem = payload.new as T;

    // Check for duplicates
    const exists = currentList.some(item => item.id === newItem.id);
    if (exists) {
        console.log('Duplicate item detected, skipping insert:', newItem.id);
        return currentList;
    }

    // Prepend new item to maintain chronological order
    return [newItem, ...currentList];
}

/**
 * Merge a realtime UPDATE event into an array
 */
export function mergeRealtimeUpdate<T extends { id: string }>(
    currentList: T[],
    payload: RealtimePostgresChangesPayload<T>
): T[] {
    if (payload.eventType !== 'UPDATE') return currentList;

    const updatedItem = payload.new as T;

    return currentList.map(item =>
        item.id === updatedItem.id ? updatedItem : item
    );
}

/**
 * Merge a realtime DELETE event into an array
 */
export function mergeRealtimeDelete<T extends { id: string }>(
    currentList: T[],
    payload: RealtimePostgresChangesPayload<T>
): T[] {
    if (payload.eventType !== 'DELETE') return currentList;

    const deletedItem = payload.old as T;

    return currentList.filter(item => item.id !== deletedItem.id);
}

/**
 * Generic merge function for realtime events
 */
export function mergeRealtimeEvent<T extends { id: string }>(
    currentList: T[],
    payload: RealtimePostgresChangesPayload<T>
): T[] {
    switch (payload.eventType) {
        case 'INSERT':
            return mergeRealtimeInsert(currentList, payload);
        case 'UPDATE':
            return mergeRealtimeUpdate(currentList, payload);
        case 'DELETE':
            return mergeRealtimeDelete(currentList, payload);
        default:
            return currentList;
    }
}

/**
 * Check if a payload originated from the current client
 * (Requires client_id to be included in row data)
 */
export function isOwnClientPayload(
    payload: RealtimePostgresChangesPayload<any>,
    clientId: string
): boolean {
    const data = payload.new || payload.old;
    return data?.client_id === clientId;
}

/**
 * Generate a unique client ID for deduplication
 */
export function generateClientId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Coalesce multiple rapid updates into a single state update
 */
export class UpdateCoalescer<T> {
    private updates: Map<string, T> = new Map();
    private timeout: NodeJS.Timeout | null = null;
    private callback: (updates: T[]) => void;
    private delay: number;

    constructor(callback: (updates: T[]) => void, delay: number = 150) {
        this.callback = callback;
        this.delay = delay;
    }

    add(key: string, value: T) {
        this.updates.set(key, value);

        if (this.timeout) clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            this.flush();
        }, this.delay);
    }

    flush() {
        if (this.updates.size > 0) {
            this.callback(Array.from(this.updates.values()));
            this.updates.clear();
        }
        this.timeout = null;
    }

    clear() {
        this.updates.clear();
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
}
