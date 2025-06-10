# React 2D Game with Real-time Synchronization

This project is a simple 2D game where players control colored squares, and their movements are synchronized in real-time using Firebase Realtime Database.

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

3.  **Set up Firebase:**
    * Create a new project on [Firebase Console](https://console.firebase.google.com/).
    * Enable the Realtime Database in your project.
    * Copy your Firebase configuration from Project Settings > General > Your Apps > Web app.

4.  **Configure environment variables:**
    * Create a `.env` file in the root of the project by copying `.env.example`:
        ```bash
        cp .env.example .env
        ```
    * Open the `.env` file and fill in your Firebase configuration values:
        ```
        VITE_FIREBASE_API_KEY=your_api_key
        VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
        VITE_FIREBASE_PROJECT_ID=your_project_id
        VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
        VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
        VITE_FIREBASE_APP_ID=your_app_id
        VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
        VITE_FIREBASE_DATABASE_URL=your_database_url
        ```

5.  **Set up Realtime Database Rules:**
    * In your Firebase Console, go to Realtime Database > Rules.
    * Replace the default rules with these game-specific rules:
        ```json
        {
          "rules": {
            "players": {
              ".read": true,  // Anyone can read player data
              ".write": true,  // Anyone can write player data
              "$playerId": {
                // Validate the data structure
                ".validate": "newData.hasChildren(['id', 'x', 'y', 'color', 'name'])
                  && newData.child('id').isString()
                  && newData.child('x').isNumber()
                  && newData.child('y').isNumber()
                  && newData.child('color').isString()
                  && newData.child('name').isString()
                  // Ensure player ID in the data matches the location
                  && newData.child('id').val() === $playerId",
                // Define allowed fields and their types
                "id": { ".validate": "newData.isString()" },
                "x": { ".validate": "newData.isNumber()" },
                "y": { ".validate": "newData.isNumber()" },
                "color": { ".validate": "newData.isString()" },
                "name": { ".validate": "newData.isString()" },
                "$other": { ".validate": false } // No other fields allowed
              }
            }
          }
        }
        ```
        These rules ensure:
        * All players can read and write to the players node
        * Each player entry must have the required fields (id, x, y, color, name)
        * Field types are validated
        * No additional fields are allowed
        * The player ID in the data must match the database location

6.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running, typically at `http://localhost:5173`.

## Project Structure

```
/src
├─ /components
│    ├─ GameField.tsx         // Canvas/drawing all players
│    ├─ PlayerList.tsx        // Displays list of active players
│    └─ PlayerNameForm.tsx    // Form for user to enter nickname
├─ /hooks
│    ├─ usePlayerMovement.ts  // WASD handling + sending coordinates
│    └─ useRealtimePlayers.ts // Subscribing to the players data via Firebase
├─ /services
│    └─ firebase.ts           // Initialization and methods for Firebase
├─ App.tsx                    // Entry point, main game logic
├─ main.tsx                   // Main React render call
└─ index.css                  // TailwindCSS base styles
```
