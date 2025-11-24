import { useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { debounce } from '../utils/realtimeUtils';

type PostgresEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface RealtimeOptions {
    events?: PostgresEvent[];
    debounceMilliseconds?: number;
    reconnectBackoff?: number;
}

interface RealtimeFilteredOptions {
    table: string;
    filter?: string;
    callback: (payload: RealtimePostgresChangesPayload<any>) => void;
    events?: PostgresEvent[];
    debounceMilliseconds?: number;
}

/**
 * Hook for subscribing to Supabase Realtime changes on a table
 * @param tableName - The table to subscribe to
 * @param callback - Function called when changes occur
 * @param opts - Configuration options
 */
export function useSupabaseRealtime(
    tableName: string,
    callback: (payload: RealtimePostgresChangesPayload<any>) => void,
    opts: RealtimeOptions = {}
) {
    const {
        events = ['*'],
        debounceMilliseconds = 0,
        reconnectBackoff = 1000
    } = opts;

    const channelRef = useRef<RealtimeChannel | null>(null);
    const callbackRef = useRef(callback);

    // Keep callback ref up to date
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const debouncedCallback = debounceMilliseconds > 0
            ? debounce(callbackRef.current, debounceMilliseconds)
            : callbackRef.current;

        // Create unique channel name with timestamp to avoid conflicts
        const channelName = `realtime:${tableName}:${Date.now()}`;
        const channel = supabase.channel(channelName);

        // Subscribe to all requested events
        events.forEach(event => {
            (channel as any).on(
                'postgres_changes' as any,
                {
                    event,
                    schema: 'public',
                    table: tableName
                },
                (payload: any) => {
                    debouncedCallback(payload);
                }
            );
        });

        // Subscribe and handle errors
        channel.subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
                console.log(`✅ Realtime subscribed to ${tableName}`);
            }
            if (status === 'CHANNEL_ERROR') {
                console.error(`❌ Realtime error on ${tableName}:`, err);
                // Implement reconnect with backoff
                setTimeout(() => {
                    channel.subscribe();
                }, reconnectBackoff);
            }
            if (status === 'TIMED_OUT') {
                console.warn(`⏱️ Realtime timed out on ${tableName}, retrying...`);
            }
        });

        channelRef.current = channel;

        // Cleanup on unmount
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
                console.log(`🔌 Unsubscribed from ${tableName}`);
            }
        };
    }, [tableName, events.join(','), debounceMilliseconds, reconnectBackoff]);

    return channelRef.current;
}

/**
 * Hook for subscribing to filtered Supabase Realtime changes
 * @param options - Configuration with table, filter, callback, and events
 */
export function useSupabaseRealtimeFiltered(options: RealtimeFilteredOptions) {
    const {
        table,
        filter,
        callback,
        events = ['*'],
        debounceMilliseconds = 0
    } = options;

    const channelRef = useRef<RealtimeChannel | null>(null);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const debouncedCallback = debounceMilliseconds > 0
            ? debounce(callbackRef.current, debounceMilliseconds)
            : callbackRef.current;

        const channelName = `realtime:${table}:${filter || 'all'}:${Date.now()}`;
        const channel = supabase.channel(channelName);

        events.forEach(event => {
            const config: any = {
                event,
                schema: 'public',
                table
            };

            if (filter) {
                config.filter = filter;
            }

            (channel as any).on(
                'postgres_changes' as any,
                config,
                (payload: any) => {
                    debouncedCallback(payload);
                }
            );
        });

        channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log(`✅ Realtime subscribed to ${table} with filter: ${filter || 'none'}`);
            }
        });

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [table, filter, events.join(','), debounceMilliseconds]);

    return channelRef.current;
}
