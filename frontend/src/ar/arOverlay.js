let _animFrame = 0;

export function drawOverlay(ctx, overlayState = {}) {
    const { box, tint, labelText, infoLines } = overlayState;
    _animFrame++;

    if (!box) return;

    const W = ctx.canvas.width;
    const H = ctx.canvas.height;

    const x = Math.round(box.x * W);
    const y = Math.round(box.y * H);
    const w = Math.round(box.w * W);
    const h = Math.round(box.h * H);
    const cx = x + w / 2;
    const cy = y + h / 2;

    const isHealthy = tint && tint.includes("46, 204");
    const color = isHealthy ? "#2ecc71" : "#e74c3c";
    const colorRgb = isHealthy ? "46,204,113" : "231,76,60";

    // Subtle fill
    ctx.fillStyle = `rgba(${colorRgb},0.10)`;
    ctx.fillRect(x, y, w, h);

    // Animated corner brackets
    const cLen = Math.min(w, h) * 0.22;
    const pulse = 0.75 + 0.25 * Math.sin(_animFrame * 0.08);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10 * pulse;
    ctx.lineCap = "square";

    ctx.beginPath();
    ctx.moveTo(x + cLen, y);       ctx.lineTo(x, y);       ctx.lineTo(x, y + cLen);
    ctx.moveTo(x + w - cLen, y);   ctx.lineTo(x + w, y);   ctx.lineTo(x + w, y + cLen);
    ctx.moveTo(x, y + h - cLen);   ctx.lineTo(x, y + h);   ctx.lineTo(x + cLen, y + h);
    ctx.moveTo(x + w, y + h - cLen); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - cLen, y + h);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Center crosshair dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Pulsing ring around center
    const ringR = 14 + 6 * Math.sin(_animFrame * 0.10);
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${colorRgb},${0.5 + 0.4 * Math.sin(_animFrame * 0.10)})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // HUD info panel — right side if room, else left
    const panelW = 190;
    const panelH = 90;
    const margin = 16;
    let panelX = x + w + margin;
    if (panelX + panelW > W - 4) panelX = x - panelW - margin;
    if (panelX < 4) panelX = 4;
    const panelY = Math.max(4, Math.min(H - panelH - 4, cy - panelH / 2));

    // Leader line from box edge to panel
    const lineStartX = panelX > cx ? x + w : x;
    const lineStartY = cy;
    const lineEndX = panelX > cx ? panelX : panelX + panelW;
    const lineEndY = panelY + panelH / 2;
    const midX = (lineStartX + lineEndX) / 2;

    ctx.beginPath();
    ctx.moveTo(lineStartX, lineStartY);
    ctx.lineTo(midX, lineStartY);
    ctx.lineTo(midX, lineEndY);
    ctx.lineTo(lineEndX, lineEndY);
    ctx.strokeStyle = `rgba(${colorRgb},0.6)`;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Panel background
    ctx.fillStyle = "rgba(8,10,12,0.88)";
    ctx.strokeStyle = `rgba(${colorRgb},0.7)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(panelX, panelY, panelW, panelH);
    ctx.fill();
    ctx.stroke();

    // Panel top accent bar
    ctx.fillStyle = color;
    ctx.fillRect(panelX, panelY, panelW, 3);

    // Panel text
    if (labelText) {
        const lines = (infoLines || [labelText]);
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        // Title line
        ctx.font = "700 12px monospace";
        ctx.fillStyle = color;
        ctx.fillText("PLANT HEALTH MONITOR", panelX + 10, panelY + 10);

        // Data lines
        ctx.font = "600 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto";
        ctx.fillStyle = "#f5f5f7";
        lines.forEach((line, i) => {
            ctx.fillText(line, panelX + 10, panelY + 28 + i * 18);
        });
    }

    // Scan sweep line inside box
    const scanY = y + (((_animFrame * 2) % (h + 1)));
    const sweepGrad = ctx.createLinearGradient(x, scanY - 8, x, scanY + 8);
    sweepGrad.addColorStop(0, `rgba(${colorRgb},0)`);
    sweepGrad.addColorStop(0.5, `rgba(${colorRgb},0.5)`);
    sweepGrad.addColorStop(1, `rgba(${colorRgb},0)`);
    ctx.fillStyle = sweepGrad;
    ctx.fillRect(x, Math.max(y, scanY - 8), w, Math.min(16, h));
}
