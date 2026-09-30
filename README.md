<p align="center"><img src="docs/flow-3.svg" alt="Animated AR Plant Health pipeline: Camera → Detect → Classify → Advise → Overlay" width="100%"/></p>

<p align="center"><sub>10-second tour: Camera → Detect → Classify → Advise → Overlay</sub></p>

<p align="center"><img src="docs/px3/intro.svg" width="100%" alt="Point your camera at a leaf and get an instant AI diagnosis with a live 3D AR overlay."/></p>

<p align="center"><img src="docs/px3/features.svg" width="100%" alt="Key features"/></p>

<p align="center"><img src="docs/px3/gap.svg" width="1" height="16" alt=""/></p>

<a id="what-it-does"></a>
<h2><img src="docs/px3/h2-what-it-does.svg" width="100%" alt="What it does"/></h2>

<p align="center"><img src="docs/px3/t-01.svg" width="100%" alt="Opens your device camera in the browser Detects the leaf&#x27;s bounding box using OpenCV HSV segmentation Classifies the disease (or healthy) with a DenseNet121 model trained on PlantVillage Draws a color-coded 3D AR overlay (Three.js ring + contour) anchored to the detected leaf Shows diagnosis, confidence score, and treatment recommendation in a result panel Supports 15 disease classes across 3 plants: Plant | Conditions Tomato | Bacterial spot, Early blight, Late blight, Leaf mold, Septoria leaf spot, Spider mites, Target spot, Yellow Leaf Curl Virus, Mosaic virus, Healthy Potato | Early blight, Late blight, Healthy Pepper bell | Bacterial spot, Healthy"/></p>

<p align="center"><img src="docs/px3/gap.svg" width="1" height="16" alt=""/></p>

<a id="demo"></a>
<h2><img src="docs/px3/h2-demo.svg" width="100%" alt="Demo"/></h2>

![Architecture Diagram](docs/architecture_diagram.png)

<p align="center"><img src="docs/px3/gap.svg" width="1" height="16" alt=""/></p>

<a id="architecture"></a>
<h2><img src="docs/px3/h2-architecture.svg" width="100%" alt="Architecture"/></h2>

<p align="center"><img src="docs/px3/c-01.svg" width="100%" alt="code: Browser Camera ↓ JPEG frame (every N seconds or on demand) POST /predict ── Flask API (port 5001) ├── DenseNet121 (Keras) → disease label + confidence └── OpenC"/></p>

<p align="center"><img src="docs/px3/gap.svg" width="1" height="16" alt=""/></p>

<a id="tech-stack"></a>
<h2><img src="docs/px3/h2-tech-stack.svg" width="100%" alt="Tech Stack"/></h2>

<p align="center"><img src="docs/px3/t-02.svg" width="100%" alt="Layer | Technology Disease model | TensorFlow / Keras, DenseNet121 Leaf detection | OpenCV HSV segmentation Backend | Python 3.12, Flask, Flask-CORS Frontend | Vanilla JS ES modules 3D AR overlay | Three.js (orthographic, screen-space) Dataset | PlantVillage (via Kaggle)"/></p>

<p align="center"><img src="docs/px3/gap.svg" width="1" height="16" alt=""/></p>

<a id="quick-start"></a>
<h2><img src="docs/px3/h2-quick-start.svg" width="100%" alt="Quick Start"/></h2>

<a id="prerequisites"></a>
<h3><img src="docs/px3/h3-prerequisites.svg" width="100%" alt="Prerequisites"/></h3>

<p align="center"><img src="docs/px3/t-03.svg" width="100%" alt="Python 3.12 Node.js (for npm install) A browser with camera access (Chrome/Firefox recommended)"/></p>

<a id="1-clone"></a>
<h3><img src="docs/px3/h3-1-clone.svg" width="100%" alt="1. Clone"/></h3>

<p align="center"><img src="docs/px3/c-02.svg" width="100%" alt="code: git clone https://github.com/thanmaiashok/AR-Plant-Health-Checker.git cd AR-Plant-Health-Checker "/></p>

<a id="2-backend-setup"></a>
<h3><img src="docs/px3/h3-2-backend-setup.svg" width="100%" alt="2. Backend setup"/></h3>

<p align="center"><img src="docs/px3/c-03.svg" width="100%" alt="code: cd backend python3.12 -m venv venv ./venv/bin/pip install -r requirements.txt cd .. "/></p>

<a id="3-frontend-setup"></a>
<h3><img src="docs/px3/h3-3-frontend-setup.svg" width="100%" alt="3. Frontend setup"/></h3>

<p align="center"><img src="docs/px3/c-04.svg" width="100%" alt="code: cd frontend npm install cd .. "/></p>

<a id="4-run-both-services-in-one-command"></a>
<h3><img src="docs/px3/h3-4-run-both-services-in-one-command.svg" width="100%" alt="4. Run (both services in one command)"/></h3>

<p align="center"><img src="docs/px3/c-05.svg" width="100%" alt="code: ./start.sh "/></p>

<p align="center"><img src="docs/px3/t-04.svg" width="100%" alt="Then open: http://127.0.0.1:8080/public/index.html"/></p>

<p align="center"><img src="docs/px3/c-06.svg" width="100%" alt="code: # Stop everything ./kill.sh "/></p>

<p align="center"><img src="docs/px3/t-05.svg" width="100%" alt="Windows:"/></p>

<p align="center"><img src="docs/px3/c-07.svg" width="100%" alt="code: start.bat kill.bat "/></p>

<a id="manual-startup"></a>
<h3><img src="docs/px3/h3-manual-startup.svg" width="100%" alt="Manual startup"/></h3>

<p align="center"><img src="docs/px3/c-08.svg" width="100%" alt="code: # Terminal 1 — backend (port 5001) cd backend PYTHONPATH=$(pwd) ./venv/bin/python api/server.py # Terminal 2 — frontend (port 8080) cd frontend python3 -m http."/></p>

<p align="center"><img src="docs/px3/gap.svg" width="1" height="16" alt=""/></p>

<a id="dataset"></a>
<h2><img src="docs/px3/h2-dataset.svg" width="100%" alt="Dataset"/></h2>

<p align="center"><img src="docs/px3/t-06.svg" width="100%" alt="The model is trained on the PlantVillage dataset.Download from Kaggle and place it at:"/></p>

<p align="center"><a href="https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset"><img src="docs/px3/link-01.svg" height="34" alt="Kaggle"/></a></p>

<p align="center"><img src="docs/px3/c-09.svg" width="100%" alt="code: backend/dataset/PlantVillage/ "/></p>

<p align="center"><img src="docs/px3/t-07.svg" width="100%" alt="Run training:"/></p>

<p align="center"><img src="docs/px3/c-10.svg" width="100%" alt="code: cd backend/training ../../venv/bin/python preprocess_data.py ../../venv/bin/python train_model.py ../../venv/bin/python evaluate_model.py "/></p>

<p align="center"><img src="docs/px3/t-08.svg" width="100%" alt="The trained model (backend/models/plant_disease_model.keras) is included in this repo (37 MB)."/></p>

<p align="center"><img src="docs/px3/gap.svg" width="1" height="16" alt=""/></p>

<a id="api-reference"></a>
<h2><img src="docs/px3/h2-api-reference.svg" width="100%" alt="API Reference"/></h2>

<a id="post-predict"></a>
<h3><img src="docs/px3/h3-post-predict.svg" width="100%" alt="POST /predict"/></h3>

<p align="center"><img src="docs/px3/t-09.svg" width="100%" alt="Request: multipart/form-data with field image (JPEG or PNG) Response:"/></p>

<p align="center"><img src="docs/px3/c-11.svg" width="100%" alt="code: { &quot;disease&quot;: &quot;Tomato_Early_blight&quot;, &quot;confidence&quot;: 0.97, &quot;recommendation&quot;: &quot;Prune lower leaves and use mulch to reduce soil splash...&quot;, &quot;leafBox&quot;: { &quot;x&quot;: 0.20, &quot;"/></p>

<p align="center"><img src="docs/px3/t-10.svg" width="100%" alt="leafBox and leafContour are null when no leaf is detected."/></p>

<a id="get-health"></a>
<h3><img src="docs/px3/h3-get-health.svg" width="100%" alt="GET /health"/></h3>

<p align="center"><img src="docs/px3/c-12.svg" width="100%" alt="code: { &quot;status&quot;: &quot;ok&quot; } "/></p>

<p align="center"><img src="docs/px3/gap.svg" width="1" height="16" alt=""/></p>

<a id="project-structure"></a>
<h2><img src="docs/px3/h2-project-structure.svg" width="100%" alt="Project Structure"/></h2>

<p align="center"><img src="docs/px3/c-13.svg" width="100%" alt="code: AR-Plant-Health-Checker/ ├── backend/ │ ├── api/ # Flask server + routes │ ├── inference/ # Predict + leaf detection │ ├── models/ # Trained .keras model + clas"/></p>

<p align="center"><img src="docs/px3/gap.svg" width="1" height="16" alt=""/></p>

<a id="contributing"></a>
<h2><img src="docs/px3/h2-contributing.svg" width="100%" alt="Contributing"/></h2>

<p align="center"><img src="docs/px3/t-11.svg" width="100%" alt="Contributions are welcome. To get started: Fork the repo Create a feature branch: git checkout -b feat/my-feature Commit with conventional commits: git commit -m &quot;feat: add X&quot; Open a Pull Request Good first issues: Add support for more plant species / disease classes Mobile PWA support WebRTC-based real-time streaming instead of polling Docker Compose setup"/></p>

<p align="center"><img src="docs/px3/gap.svg" width="1" height="16" alt=""/></p>

<a id="license"></a>
<h2><img src="docs/px3/h2-license.svg" width="100%" alt="License"/></h2>

<p align="center"><img src="docs/px3/t-12.svg" width="100%" alt="MIT - see LICENSE."/></p>

<p align="center"><a href="LICENSE"><img src="docs/px3/link-02.svg" height="34" alt="LICENSE"/></a></p>

<p align="center"><img src="docs/px3/gap.svg" width="1" height="16" alt=""/></p>

<a id="acknowledgements"></a>
<h2><img src="docs/px3/h2-acknowledgements.svg" width="100%" alt="Acknowledgements"/></h2>

<p align="center"><img src="docs/px3/t-13.svg" width="100%" alt="PlantVillage Dataset - Hughes &amp; Salathé, 2015 Three.js - 3D WebGL library TensorFlow / Keras - model training + inference"/></p>

<p align="center"><a href="https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset"><img src="docs/px3/link-03.svg" height="34" alt="PlantVillage Dataset"/></a> <a href="https://threejs.org/"><img src="docs/px3/link-04.svg" height="34" alt="Three.js"/></a> <a href="https://www.tensorflow.org/"><img src="docs/px3/link-05.svg" height="34" alt="TensorFlow / Keras"/></a></p>

<p align="center"><img src="docs/px3/gap.svg" width="1" height="16" alt=""/></p>

<p align="center"><a href="https://github.com/thanmaiashok"><img src="docs/px3/footer.svg" width="100%" alt="Built by Thanmai A, founder of FoxynAI"/></a></p>
