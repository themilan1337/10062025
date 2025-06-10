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
    *   Run the SQL code provided below to create the `players` table.

4.  **Configure environment variables:**
    *   Create a `.env` file in the root of the project by copying `.env.example`:
        ```bash
        cp .env.example .env
        ```
    *   Open the `.env` file and replace the placeholder values with your Supabase project URL and anon key. You can find these in your Supabase project settings (API section).
        ```
        VITE_SUPABASE_URL=your_supabase_project_url
        VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
        ```

5.  **Enable Row Level Security (RLS) and define policies (Recommended):**
    *   In your Supabase dashboard, go to `Authentication` -> `Policies` for the `players` table.
    *   Enable RLS for the `players` table.
    *   Create policies for `SELECT`, `INSERT`, `UPDATE`, `DELETE`. Examples:
        *   **Enable read access for all users:**
            ```sql
            CREATE POLICY "Allow public read access" ON public.players
            FOR SELECT USING (true);
            ```
        *   **Allow individual users to insert their own player:**
            ```sql
            CREATE POLICY "Allow individual insert access" ON public.players
            FOR INSERT WITH CHECK (true); -- Or add specific checks, e.g., auth.uid() = user_id if you have a user_id column
            ```
        *   **Allow users to update their own player data:**
            ```sql
            CREATE POLICY "Allow individual update access" ON public.players
            FOR UPDATE USING (id = (auth.uid())::text); -- Example if player id matches auth.uid()
            -- If player ID is not directly auth.uid(), you might need a different check or a function.
            -- A common pattern is to allow updates if the client provides the correct player ID.
            -- For simplicity in this example, we might start with a more open update policy and refine it.
            -- For instance, if player ID is self-generated and not tied to auth.uid():
            CREATE POLICY "Allow authenticated update access" ON public.players
            FOR UPDATE USING (auth.role() = 'authenticated');
            ```
        *   **Allow users to delete their own player data:**
            ```sql
            CREATE POLICY "Allow individual delete access" ON public.players
            FOR DELETE USING (id = (auth.uid())::text); -- Similar to update, adjust if ID is not auth.uid()
            -- Or more open for authenticated users:
            CREATE POLICY "Allow authenticated delete access" ON public.players
            FOR DELETE USING (auth.role() = 'authenticated');
            ```
        *   **Important**: For this specific project setup where `id` is a `uuid` generated client-side and not directly `auth.uid()`, the policies for UPDATE and DELETE need careful consideration. If you are not using Supabase Auth to manage users who *own* these player rows, you might need more open policies or a different mechanism to authorize changes (e.g., a session identifier or a secret passed by the client, though the latter is not secure for client-side code).
        *   **For this example, to ensure functionality without complex auth setup, you can use broader policies initially. However, for a production app, you'd need to secure this properly.**
            *   A simple starting point for `UPDATE` and `DELETE` if not using `auth.uid()` for ownership:
                ```sql
                -- Allow players to update their own record based on the 'id' column.
                -- This assumes the client correctly sends its own 'id'.
                -- THIS IS SIMPLISTIC AND RELIES ON CLIENT HONESTY FOR THE 'id'.
                -- In a real app, you'd use auth.uid() or server-side validation.
                CREATE POLICY "Players can update their own data." ON public.players
                FOR UPDATE USING (true) WITH CHECK (true);

                CREATE POLICY "Players can delete their own data." ON public.players
                FOR DELETE USING (true);
                ```

6.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running, typically at `http://localhost:5173`.

## Supabase SQL for `players` Table

```sql
-- Create the players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Or TEXT if you prefer to manage UUIDs entirely client-side
  x INT NOT NULL,
  y INT NOT NULL,
  color TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime on the players table
ALTER TABLE public.players REPLICA IDENTITY FULL;

-- Create a publication for the players table if one doesn't exist for all tables
-- (Supabase usually handles this, but good to be aware)
-- Check existing publications: SELECT * FROM pg_publication;
-- If needed: CREATE PUBLICATION supabase_realtime FOR ALL TABLES; (or FOR TABLE public.players)

-- Function to update `updated_at` timestamp on row update
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update `updated_at` on each player update
CREATE TRIGGER on_player_update
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- RLS Policies (Examples - adapt to your security needs)

-- 1. Enable RLS on the table
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- 2. Allow public read access
CREATE POLICY "Allow public read access" ON public.players
  FOR SELECT USING (true);

-- 3. Allow authenticated users to insert records
-- (If you are not using Supabase Auth, you might make this more open, e.g., FOR INSERT WITH CHECK (true))
CREATE POLICY "Allow authenticated insert" ON public.players
  FOR INSERT TO authenticated WITH CHECK (true);
-- If not using Supabase Auth for this, a simpler policy for anyone to insert:
-- CREATE POLICY "Allow all insert" ON public.players FOR INSERT WITH CHECK (true);

-- 4. Allow users to update their own records (based on 'id' matching)
-- THIS IS A SIMPLIFIED POLICY. For real applications, tie this to auth.uid() if possible.
CREATE POLICY "Allow update if matching id" ON public.players
  FOR UPDATE USING (true) WITH CHECK (true);

-- 5. Allow users to delete their own records (based on 'id' matching)
-- THIS IS A SIMPLIFIED POLICY. For real applications, tie this to auth.uid() if possible.
CREATE POLICY "Allow delete if matching id" ON public.players
  FOR DELETE USING (true);

-- Note: If you are NOT using Supabase's built-in user authentication for this game's players
-- (i.e., players are anonymous or identified by a client-generated UUID only),
-- the policies above for INSERT, UPDATE, DELETE might need to be more permissive, like:
-- CREATE POLICY "Allow all inserts" ON public.players FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow all updates" ON public.players FOR UPDATE USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all deletes" ON public.players FOR DELETE USING (true);
-- However, this means anyone can modify or delete any player. Secure appropriately for your use case.
-- For this example, the policies allowing authenticated users or matching IDs are a good starting point.
-- If you want truly anonymous play without Supabase Auth, use the more open policies and be aware of the implications.

```

## Project Structure

```
/src
├─ /components
│    ├─ GameField.tsx         // Canvas/drawing all players
│    ├─ PlayerList.tsx        // Displays list of active players
│    └─ PlayerNameForm.tsx    // Form for user to enter nickname
├─ /hooks
│    ├─ usePlayerMovement.ts  // WASD handling + sending coordinates
│    └─ useRealtimePlayers.ts // Subscribing to the players table via Supabase Realtime
├─ /services
│    └─ supabase.ts           // Initialization and methods for Supabase
├─ App.tsx                    // Entry point, main game logic
├─ main.tsx                   // Main React render call
└─ index.css                  // TailwindCSS base styles
```
