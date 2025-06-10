# React 2D Game with Real-time Synchronization

This project is a simple 2D game where players control colored squares, and their movements are synchronized in real-time using Supabase.

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Supabase:**
    *   Create a new project on [Supabase](https://supabase.com/).
    *   Go to the SQL Editor in your Supabase project.
    *   Run the SQL code provided below to create the `players` table and enable Realtime.

4.  **Configure environment variables:**
    *   Create a `.env` file in the root of the project by copying `.env.example`:
        ```bash
        cp .env.example .env
        ```
    *   Open the `.env` file and replace the placeholder values with your Supabase project URL and anon key. You can find these in your Supabase project settings (API section).
        ```env
        VITE_SUPABASE_URL=your_supabase_project_url
        VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
        ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Supabase SQL Schema

```sql
-- Create the players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  color TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) on the players table
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow public read access to all players
CREATE POLICY "Allow public read access" ON public.players
  FOR SELECT USING (true);

-- Allow individual users to insert their own player data
CREATE POLICY "Allow individual insert" ON public.players
  FOR INSERT WITH CHECK (true); -- Simplified for this example, in a real app you might tie this to auth.uid()

-- Allow individual users to update their own player data
CREATE POLICY "Allow individual update" ON public.players
  FOR UPDATE USING (true) WITH CHECK (true); -- Simplified, consider auth.uid() = id for specific user control

-- Allow individual users to delete their own player data
CREATE POLICY "Allow individual delete" ON public.players
  FOR DELETE USING (true); -- Simplified, consider auth.uid() = id for specific user control

-- Enable Realtime for the players table
-- This is done by ensuring the table is part of the 'public' schema and RLS is set up.
-- Supabase automatically picks up changes for tables with RLS enabled if you subscribe to them.

-- Optional: Create a trigger to update the 'updated_at' timestamp on every update
CREATE OR REPLACE FUNCTION public.handle_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_player_update
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Ensure the supabase_realtime publication includes the players table.
-- This is usually handled by Supabase by default for tables in the public schema.
-- If you have issues, you might need to explicitly add it:
-- BEGIN;
--   -- remove the players table from the publication
--   ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.players;
--   -- add the players table to the publication
--   ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
-- COMMIT;
-- Check current publications:
-- SELECT * FROM pg_publication_tables WHERE schemaname = 'public' AND tablename = 'players';
```

## Playing the Game

*   Open two browser tabs or windows to `http://localhost:5173`.
*   Enter a nickname in the form that appears.
*   Use the WASD keys to move your player square.
*   You should see the other player's square move in real-time.
*   Closing a tab will remove the player from the game for others.
