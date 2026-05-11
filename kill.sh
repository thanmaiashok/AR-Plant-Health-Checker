#!/bin/bash
set +e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -f backend_pid.txt ]; then
    kill $(cat backend_pid.txt) 2>/dev/null
    kill -9 $(cat backend_pid.txt) 2>/dev/null
    rm -f backend_pid.txt
    echo "Backend process killed."
fi

if [ -f frontend_pid.txt ]; then
    kill $(cat frontend_pid.txt) 2>/dev/null
    kill -9 $(cat frontend_pid.txt) 2>/dev/null
    rm -f frontend_pid.txt
    echo "Frontend process killed."
fi

# Fallback: kill processes holding ports
# Backend default is 5001 (macOS often uses 5000 for AirPlay/AirTunes).
pids_5001=$(lsof -ti :5001 2>/dev/null)
if [ -n "$pids_5001" ]; then
    kill -9 $pids_5001 2>/dev/null
fi

pids_8080=$(lsof -ti :8080 2>/dev/null)
if [ -n "$pids_8080" ]; then
    kill -9 $pids_8080 2>/dev/null
fi

echo "All services stopped."
