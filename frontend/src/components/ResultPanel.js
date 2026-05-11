function formatLabel(raw) {
    return (raw || "Unknown")
        .replace(/__+/g, " — ")
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
}

export function showResult(data) {
    const resultDiv = document.getElementById("result");

    const confidence = typeof data.confidence === "number" ? data.confidence : 0;
    const confidencePct = Math.max(0, Math.min(100, confidence * 100));
    const leafAreaPct = data.leafBox && typeof data.leafBox.area === "number"
        ? Math.max(0, Math.min(100, data.leafBox.area * 100))
        : null;

    const label = (data.disease || "").toLowerCase();
    const isHealthy = label.includes("healthy");
    const meterColor = isHealthy ? "#2ecc71" : confidencePct > 80 ? "#e74c3c" : "#f1c40f";
    const badge = isHealthy
        ? `<span class="badge badge-healthy">Healthy</span>`
        : `<span class="badge badge-disease">Disease Detected</span>`;

    if (resultDiv) {
        const healthState = isHealthy ? "healthy" : label ? "disease" : "unknown";
        resultDiv.dataset.health = healthState;
    }

    resultDiv.innerHTML = `
        <h3>Disease Detection ${badge}</h3>
        <p><b>Diagnosis:</b> ${formatLabel(data.disease)}</p>
        <p><b>Confidence:</b> ${confidencePct.toFixed(1)}%</p>
        <div class="meter"><div class="meterFill" style="width:${confidencePct.toFixed(1)}%;background:${meterColor}"></div></div>
        ${leafAreaPct !== null ? `<p><b>Leaf Coverage:</b> ${leafAreaPct.toFixed(1)}%</p>` : ""}
        <p><b>Recommendation:</b> ${data.recommendation}</p>
    `;

    // Trigger small "pop" animation after updates
    resultDiv.classList.remove("resultUpdated");
    void resultDiv.offsetWidth;
    resultDiv.classList.add("resultUpdated");
}
