# Digital Homestead

Digital Homestead is a rural education platform with a React frontend and an Express backend connected to MongoDB.

## Features

- Student and teacher login
- Course video browsing and playback
- Quiz creation and quiz attempts
- Notes upload and access
- Student progress and watch history

## Requirements

- Node.js
- MongoDB

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root.

3. Add the required values:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   API_PORT=5000
   CLIENT_ORIGIN=http://localhost:3000
   ```

4. Start the app:

   ```bash
   npm start
   ```

## Run Separately

If you want to run the services in separate terminals:

- Frontend only:

  ```bash
  npm run dev
  ```

- Backend only:

  ```bash
  npm run dev:api
  ```

## Project Structure

- `src/` - React frontend
- `server/` - Express API and MongoDB models
- `scripts/` - startup helper scripts

## Notes

- The frontend runs on `http://localhost:3000`.
- The backend API is available through the Vite proxy during development.
- If MongoDB is not available, the API can fall back to in-memory development data for local testing.
