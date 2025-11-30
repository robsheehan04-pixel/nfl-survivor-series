# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Choose your organization (or create one)
4. Enter project details:
   - **Name**: NFL Survivor Series
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait for setup (~2 minutes)

## 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

3. Add them to your `.env` file:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Run the Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `supabase/schema.sql` (in this project)
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned" for each statement

## 4. Enable Realtime

1. Go to **Database** → **Replication**
2. Under "Realtime", click on your tables to enable:
   - `series`
   - `series_members`
   - `picks`
   - `invitations`

## 5. Configure Authentication (Optional)

If you want to use Supabase Auth instead of/alongside Google OAuth:

1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Enter your Google OAuth credentials
4. Update the callback URL in Google Cloud Console

## 6. Test the Connection

Restart your dev server:
```bash
npm run dev
```

The app should now sync data across all users in real-time!

---

## Database Schema Overview

### Tables

- **users**: Stores user profiles (synced from Google OAuth)
- **series**: Survivor series/pools
- **series_members**: Links users to series with their status
- **picks**: Weekly team picks
- **invitations**: Pending invitations

### Row Level Security (RLS)

All tables have RLS enabled:
- Users can only see series they're members of
- Users can only modify their own picks
- Series creators can manage invitations
- Invitations are visible to invitees

---

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the schema.sql in the SQL Editor

### Data not syncing
- Check that Realtime is enabled for the tables
- Verify your SUPABASE_URL and SUPABASE_ANON_KEY are correct

### Permission denied
- RLS policies may be blocking access
- Check the user is properly authenticated
