#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Start Backend
echo "Starting Backend..."
cd "$ROOT_DIR/backend"

export PYTHONPATH="$(pwd)"
export PORT="${PORT:-5001}"

PYTHON_BIN="$ROOT_DIR/backend/venv/bin/python"
if [ ! -x "$PYTHON_BIN" ]; then
	echo "ERROR: backend/venv not found. Run: cd backend && python3.12 -m venv venv && ./venv/bin/pip install -r requirements.txt"
	exit 1
fi

"$PYTHON_BIN" api/server.py >/dev/null 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend_pid.txt
cd "$ROOT_DIR"

# Wait for backend to be reachable
for i in {1..40}; do
	if curl -s --max-time 1 "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
		break
	fi
	sleep 0.25
done

# Start Frontend
echo "Starting Frontend..."
cd "$ROOT_DIR/frontend"
python3 -m http.server 8080 --bind 127.0.0.1 >/dev/null 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend_pid.txt
cd "$ROOT_DIR"

# Wait for frontend to be reachable
for i in {1..40}; do
    if curl -s --max-time 1 "http://127.0.0.1:8080/public/index.html" >/dev/null 2>&1; then
        break
    fi
    sleep 0.10
done

echo "Services started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Backend:  http://127.0.0.1:${PORT}/ (health: /health)"
echo "Frontend: http://127.0.0.1:8080/public/index.html"
