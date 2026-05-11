import { startCamera } from "./ar/arCamera.js";
import { drawOverlay } from "./ar/arOverlay.js";
import { init3DOverlay } from "./ar/ar3dOverlay.js";
import { captureImage } from "./services/imageUpload.js";
import { sendImageToAPI } from "./services/apiService.js";
import { showResult } from "./components/ResultPanel.js";
import { updateHealth } from "./components/HealthIndicator.js";

const video = document.getElementById("camera");
const canvas = document.getElementById("overlay");
const canvas3d = document.getElementById("overlay3d");
const ctx = canvas.getContext("2d");
const statusDiv = document.getElementById("status");
const autoScanToggle = document.getElementById("autoScanToggle");
const snapshotBtn = document.getElementById("snapshotBtn");
const historyList = document.getElementById("historyList");

// Live overlay state rendered continuously while video plays
const overlayState = {
    box: null,
    tint: null,
    labelText: null,
    infoLines: null
};

let overlay3d = null;

let lastCapturedBlob = null;
let autoScanTimer = null;
let requestInFlight = false;
const history = [];

let overlayRafId = null;

function setStatus(text) {
    if (statusDiv) statusDiv.textContent = text;
}

function formatLabel(label) {
    return (label || "Unknown").replace(/_/g, " ");
}

function renderHistory() {
    if (!historyList) return;
    if (history.length === 0) {
        historyList.textContent = "No scans yet";
        return;
    }

    historyList.innerHTML = history.map(item => {
        const time = new Date(item.time).toLocaleTimeString();
        const confidencePct = (item.confidence * 100).toFixed(1);

        const normalized = (item.disease || "").toLowerCase();
        const healthState = normalized.includes("healthy") ? "healthy" : normalized ? "disease" : "unknown";

        return `
            <div class="historyItem" data-health="${healthState}">
                <div class="historyLeft">
                    <div><b>${formatLabel(item.disease)}</b></div>
                    <div style="opacity:0.85">${time}</div>
                </div>
                <div class="historyRight">
                    <div>${confidencePct}%</div>
                </div>
            </div>
        `;
    }).join("");
}

async function init() {
    await startCamera(video);

    video.addEventListener("play", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        if (canvas3d) {
            canvas3d.width = video.videoWidth;
            canvas3d.height = video.videoHeight;
            overlay3d = init3DOverlay(canvas3d);
            overlay3d.resize(canvas3d.width, canvas3d.height);
            overlay3d.start();
        }

        // 2D overlay: AR brackets + label always drawn on top of video.
        // Use requestAnimationFrame for smoother animation than setInterval.
        if (overlayRafId) cancelAnimationFrame(overlayRafId);
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawOverlay(ctx, overlayState);
            overlayRafId = requestAnimationFrame(render);
        };
        render();
    });
}

async function analyzePlant() {
    if (requestInFlight) return;
    requestInFlight = true;
    setStatus("Analyzing...");
    document.body.classList.add("analyzing");

    try {
        const imageBlob = await captureImage(video);
        lastCapturedBlob = imageBlob;
        if (snapshotBtn) snapshotBtn.disabled = !lastCapturedBlob;

        const result = await sendImageToAPI(imageBlob);

        // Call modular components
        showResult(result);
        // Based on the 'disease' from the API result
        updateHealth(result.disease);

    // Contextual green or red AR fill effect
    const label = (result.disease || "").toLowerCase();
    const isHealthy = label.includes("healthy");

        overlayState.tint = isHealthy
            ? "rgba(46, 204, 113, 0.4)"
            : "rgba(231, 76, 60, 0.4)";
        overlayState.box = result.leafBox || null;
        const confPct = (result.confidence * 100).toFixed(1);
        overlayState.labelText = result.leafBox ? formatLabel(result.disease) : null;
        overlayState.infoLines = result.leafBox ? [
            `${formatLabel(result.disease)}`,
            `Confidence: ${confPct}%`,
            `${isHealthy ? "Status: Healthy" : "Status: Disease"}`
        ] : null;

        if (overlay3d) {
            const confidencePct = typeof result.confidence === "number" ? (result.confidence * 100).toFixed(1) : "0.0";
            overlay3d.setTarget({
                leafBox: result.leafBox || null,
                leafContour: result.leafContour || null,
                healthy: isHealthy,
                labelText: `${(result.disease || "Unknown").replace(/_/g, " ")} • ${confidencePct}%`
            });
        }

        history.unshift({
            time: Date.now(),
            disease: result.disease,
            confidence: typeof result.confidence === "number" ? result.confidence : 0
        });
        history.splice(5);
        renderHistory();

        if (!result.leafBox) {
            setStatus("No leaf detected — frame a leaf and try again");
        } else {
            setStatus("Ready");
        }
        return result;
    } catch (e) {
        console.error(e);
        setStatus("Error (check backend)");
    } finally {
        requestInFlight = false;
        document.body.classList.remove("analyzing");
    }
}

function startAutoScan() {
    if (autoScanTimer) return;
    autoScanTimer = setInterval(() => {
        analyzePlant();
    }, 1000);
}

function stopAutoScan() {
    if (!autoScanTimer) return;
    clearInterval(autoScanTimer);
    autoScanTimer = null;
}

function saveSnapshot() {
    if (!lastCapturedBlob) return;
    const url = URL.createObjectURL(lastCapturedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plant-scan-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

document.getElementById("analyzeBtn").addEventListener("click", analyzePlant);

autoScanToggle?.addEventListener("change", (e) => {
    if (e.target.checked) {
        document.body.classList.add("autoscan");
        startAutoScan();
    } else {
        document.body.classList.remove("autoscan");
        stopAutoScan();
    }
});

snapshotBtn?.addEventListener("click", saveSnapshot);

init();
