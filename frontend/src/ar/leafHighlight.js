export function highlightLeaf(ctx) {

    const healthStates = [
        "Healthy",
        "Low Water",
        "Possible Disease"
    ];

    const randomHealth =
        healthStates[Math.floor(Math.random() * healthStates.length)];

    ctx.fillStyle = "rgba(255,0,0,0.3)";
    ctx.fillRect(200, 120, 200, 200);

    return randomHealth;

}
