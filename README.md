# Lastbench - Anonymous College Gossip App 🎓

A real-time social platform for college students to share anonymous posts, comments, and interact with their peers.

## 🚀 Features

- ✅ **Anonymous Posting** - Share thoughts without revealing identity
- ✅ **Real-time Updates** - Posts and comments update instantly via Supabase Realtime
- ✅ **Instagram-style Notifications** - Bell icon with live notifications for likes, comments, and replies
- ✅ **Image Support** - Upload and share images with posts
- ✅ **Likes & Comments** - Engage with post content
- ✅ **College-based Feed** - See content only from your college
- ✅ **Dark Mode** - Eye-friendly theme support
- ✅ **Progressive Web App** - Install on mobile devices
- ✅ **Offline Support** - Cached content available offline

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Realtime + Auth + Storage)
- **Mobile**: Capacitor (iOS/Android)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks 
- **Real-time**: Supabase Realtime subscriptions

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Setup

1. **Clone the repository**
```bash
git clone <repo-url>
cd lastbench---anonymous-college-gossip-2
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create `.env.local`:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_USE_SUPABASE_REALTIME=true
```

4. **Set up Supabase database**

Run the SQL scripts in `supabase-realtime-README.md` to:
- Create notifications table
- Enable Realtime on tables (posts, comments, interactions, notifications)
- Set up database triggers for automatic notifications

5. **Start development server**
```bash
npm run dev
```

6. **Build for production**
```bash
npm run build
```

7. **Run on mobile** (optional)
```bash
npm run build
npx cap sync
npx cap open android  # or ios
```

## 🔔 Realtime Features

This app uses Supabase Realtime for instant updates:

- **Live Posts**: New posts appear automatically without refresh
- **Live Comments**: Comments update in real-time on posts
- **Live Likes**: Like counts update instantly across all clients
- **Push Notifications**: Get notified when someone likes or comments on your posts

### Enabling Realtime

Set `VITE_USE_SUPABASE_REALTIME=true` in your `.env.local` file.

See `supabase-realtime-README.md` for detailed setup instructions.

## 📱 Building APK

### Android

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### iOS

```bash
npm run build
npx cap sync ios
npx cap open ios
# Build in Xcode
```

## 🧪 Testing Realtime

A test component is included to verify Realtime functionality:

```tsx
import RealtimeTest from './components/RealtimeTest';

// Add to App.tsx temporarily
<RealtimeTest />
```

This component allows you to:
- Simulate INSERT, UPDATE, DELETE events
- See realtime payloads in real-time
- Verify connection status

## 📚 Project Structure

```
├── components/          # Reusable UI components
│   ├── NotificationBell.tsx  # Notification UI
│   ├── RealtimeTest.tsx      # Testing component
│   └── ...
├── views/              # Page components
│   ├── HomeFeed.tsx    # Main feed with realtime
│   ├── CommentView.tsx # Comments section
│   └── ...
├── services/           # API & business logic
│   ├── api.ts          # Supabase API calls
│   ├── notificationService.ts  # Notification CRUD
│   └── ...
├── src/
│   ├── hooks/          # Custom React hooks
│   │   └── useSupabaseRealtime.ts  # Realtime subscription hook
│   └── utils/          # Utility functions
│       └── realtimeUtils.ts        # Merge & debounce utils
├── types/              # TypeScript definitions
└── android/            # Android/Capacitor files
```

## 🔐 Security

- **Row Level Security (RLS)**: Enabled on all Supabase tables
- **Anonymous Auth**: Users don't need email/password
- **College Isolation**: Users only see posts from their college
- **Content Moderation**: Report system for inappropriate content

## 🐛 Troubleshooting

### Realtime not working?

1. Check Supabase dashboard → Database → Replication
2. Verify environment variables are set
3. Check browser console for connection errors
4. See `supabase-realtime-README.md` for detailed troubleshooting

### Build errors?

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Mobile app issues?

```bash
npx cap sync
# Then rebuild in Android Studio/Xcode
```

## 📄 License

MIT

## 🤝 Contributing

This is a student project. Feel free to fork and adapt for your own college!

## 📧 Support

For issues or questions, check:
1. `supabase-realtime-README.md` - Realtime setup guide
2. Browser/mobile console for errors  
3. Supabase logs in dashboard

---

**Built with ❤️ for anonymous college banter** 🎓
