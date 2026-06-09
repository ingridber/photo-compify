# Photo Compify

Photo Compify is a full-stack web application for photo competitions.  
Users can create competitions, submit photos, vote on submissions, view public profiles, etc.  
A competition runs for 7 days from creation. Five days for users to submit their photos and 2 days for voting. Then the winners are determined and notified.

## Tech Stack

- Frontend: React, Vite, TypeScript, React Router, React Select, React Easy Crop
- Backend: Express, TypeScript, Mongoose, Zod
- Database: MongoDB
- Object storage: Supabase Storage, bucket `images`
- Authentication: JWT stored in an HTTP-only cookie
- Bot protection: Google reCAPTCHA for registering an account and sending reports

## Core features

- Account registration with username, email, password validation, password hashing with bcrypt, and reCAPTCHA verification.
- Login with JWT cookie creation and account lockout after repeated failed attempts.
- Competition listing with status, search, theme filtering, and pagination.
- Competition creation with optional logo image metadata.
- Image upload to Supabase with MongoDB metadata storage.
- Submission creation during the submission phase only.
- Voting during the voting phase only, with self-vote prevention and per-competition vote limits.
- Profile management for username, password, profile image, camera, and themes.
- Public profiles with user competitions, finished submissions, and stats.
- Notification retrieval and read-state updates.
- Account data export as JSON.
- Reporting images for copyright or breaking guidelines

## API documentation

If you are looking for docs for the API you can check out the wiki.
See API wiki here: [API Wiki](https://github.com/ingridber/photo-compify/wiki)

## Local development

Install dependencies in both applications:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create `backend/.env` with the variables found in `backend/.env.example`
Create `frontend/.env` with the variables found in `frontend/.env.example`

Run both apps from the repository root:

```bash
chmod +x run_dev.sh
./run_dev.sh
```

Or run them separately:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

## Backend scripts

```bash
npm run dev      # tsx watch --env-file=.env src/server.ts
npm run build    # tsc
npm start        # node --env-file=.env dist/server.js
```

## Frontend scripts

```bash
npm run dev      # vite
npm run build    # tsc -b && vite build
npm run lint     # eslint .
npm run preview  # vite preview
```
