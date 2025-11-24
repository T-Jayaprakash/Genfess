import React, { useState } from 'react';
import { useSupabaseRealtime } from '../src/hooks/useSupabaseRealtime';
import { supabase } from '../services/supabaseClient';

/**
 * Test component for Supabase Realtime integration
 * Use this to verify realtime subscriptions are working
 */
const RealtimeTest: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [testData, setTestData] = useState({ text: 'Test post' });

    // Subscribe to posts table changes
    useSupabaseRealtime(
        'posts',
        (payload) => {
            console.log('🧪 Realtime Test - Post event:', payload);
            setEvents(prev => [{
                timestamp: new Date().toISOString(),
                type: payload.eventType,
                table: 'posts',
                data: payload.new || payload.old
            }, ...prev].slice(0, 10)); // Keep last 10 events
        },
        { events: ['*'], debounceMilliseconds: 0 }
    );

    const simulateInsert = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('posts')
                .insert([{ text: testData.text, author_id: user?.id }])
                .select()
                .single();

            if (error) throw error;
            console.log('✅ Insert successful:', data);
        } catch (err) {
            console.error('❌ Insert failed:', err);
        }
    };

    const simulateUpdate = async () => {
        try {
            const { data: latestPost } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!latestPost) return;

            const { data, error } = await supabase
                .from('posts')
                .update({ text: `${testData.text} (updated)` })
                .eq('id', latestPost.id)
                .select()
                .single();

            if (error) throw error;
            console.log('✅ Update successful:', data);
        } catch (err) {
            console.error('❌ Update failed:', err);
        }
    };

    const simulateDelete = async () => {
        try {
            const { data: latestPost } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!latestPost) return;

            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', latestPost.id);

            if (error) throw error;
            console.log('✅ Delete successful');
        } catch (err) {
            console.error('❌ Delete failed:', err);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-4 max-w-sm z-50 border-2 border-accent-primary">
            <h3 className="font-bold text-lg mb-3 text-primary-text dark:text-dark-primary-text">
                🧪 Realtime Test
            </h3>

            <div className="mb-3">
                <input
                    type="text"
                    value={testData.text}
                    onChange={(e) => setTestData({ text: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Test text..."
                />
            </div>

            <div className="flex gap-2 mb-3">
                <button
                    onClick={simulateInsert}
                    className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-600"
                >
                    INSERT
                </button>
                <button
                    onClick={simulateUpdate}
                    className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-600"
                >
                    UPDATE
                </button>
                <button
                    onClick={simulateDelete}
                    className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-600"
                >
                    DELETE
                </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
                <div className="text-xs font-bold text-secondary-text dark:text-dark-secondary-text mb-1">
                    Recent Events ({events.length})
                </div>
                {events.map((event, index) => (
                    <div
                        key={index}
                        className="text-xs p-2 bg-gray-100 dark:bg-gray-800 rounded border-l-2 border-accent-primary"
                    >
                        <div className="font-bold text-accent-primary">{event.type}</div>
                        <div className="text-gray-600 dark:text-gray-400">{event.timestamp}</div>
                        <pre className="mt-1 text-xs overflow-x-auto">
                            {JSON.stringify(event.data, null, 2)}
                        </pre>
                    </div>
                ))}
                {events.length === 0 && (
                    <div className="text-xs text-gray-500 italic">
                        No events yet. Try INSERT/UPDATE/DELETE above.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RealtimeTest;
