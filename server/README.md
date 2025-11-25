# 🚀 LastBench Notification Server

This small server runs on your laptop and sends "Instagram-like" notifications automatically.

## 1. Setup
1. Open this folder in terminal:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## 2. Get the Secret Key
1. Go to [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project (`lastbench`).
3. Go to **Project Settings** (Gear icon) -> **API**.
4. Look for **`service_role`** key (secret). **Copy it**.
5. Create a file named `.env` in this folder.
6. Paste the key like this:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 3. Run It
```bash
npm start
```
Keep this running! Whenever someone likes a post, this server will see it and send a notification to the user's phone.
