export function updateHealth(health) {
    const resultDiv = document.getElementById("result");
    const normalized = (health || "").toLowerCase();

    if (!resultDiv) return;

    if (normalized.includes("healthy")) {
        resultDiv.dataset.health = "healthy";
    } else if (normalized === "unknown" || normalized === "") {
        resultDiv.dataset.health = "unknown";
    } else {
        resultDiv.dataset.health = "disease";
    }
}
