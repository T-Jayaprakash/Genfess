const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');
require('dotenv').config();

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Initialize Supabase
const supabaseUrl = 'https://koxukijufywvgnxqtuzz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
    console.error('❌ CRITICAL ERROR: Missing SUPABASE_SERVICE_ROLE_KEY');
    console.error('Please create a .env file in the server folder with:');
    console.error('SUPABASE_SERVICE_ROLE_KEY=your_key_here');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 LastBench Notification Server Started!');
console.log('Listening for new notifications...');

// Listen for new notifications
supabase
    .channel('public:notifications')
    .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        async (payload) => {
            const notification = payload.new;
            console.log('🔔 New Notification for user:', notification.user_id);

            // 1. Get the user's push tokens
            const { data: subscriptions, error } = await supabase
                .from('push_subscriptions')
                .select('token')
                .eq('user_id', notification.user_id);

            if (error) {
                console.error('Error fetching tokens:', error);
                return;
            }

            if (!subscriptions || subscriptions.length === 0) {
                console.log('⚠️ No push tokens found for this user. Skipping.');
                return;
            }

            // Filter out empty tokens
            const tokens = subscriptions.map(s => s.token).filter(t => t);

            if (tokens.length === 0) return;

            // 2. Send FCM Message
            const message = {
                notification: {
                    title: 'LastBench',
                    body: notification.content || 'You have a new interaction!'
                },
                data: {
                    // Add custom data for deep linking if needed
                    postId: notification.related_post_id || '',
                    type: notification.type || 'general'
                },
                tokens: tokens
            };

            try {
                const response = await admin.messaging().sendEachForMulticast(message);
                console.log(`✅ Sent to ${response.successCount} devices. Failed: ${response.failureCount}`);

                if (response.failureCount > 0) {
                    response.responses.forEach((resp, idx) => {
                        if (!resp.success) {
                            console.error(`  - Error for token ${tokens[idx]}:`, resp.error);
                            // Optionally delete invalid tokens here
                        }
                    });
                }
            } catch (e) {
                console.error('❌ Firebase Send Error:', e);
            }
        }
    )
    .subscribe();
