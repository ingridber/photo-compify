#!/usr/bin/env bash

# Start frontend
(cd frontend && npm run dev) &
FRONTEND_PID=$!

# Start backend
(cd backend && npm run dev) &
BACKEND_PID=$!

# Kill both on Ctrl+C
trap 'kill $FRONTEND_PID $BACKEND_PID 2>/dev/null' INT TERM

wait $FRONTEND_PID $BACKEND_PID
