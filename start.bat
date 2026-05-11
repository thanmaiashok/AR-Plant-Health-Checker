@echo off
echo Starting Backend...
cd backend
start cmd /k "venv\Scripts\activate & set PYTHONPATH=. & set PORT=5001 & python api\server.py"
cd ..

echo Starting Frontend...
cd frontend
start cmd /k "python -m http.server 8080"
cd ..
echo Services Started!
echo App running at http://localhost:8080/public/index.html
