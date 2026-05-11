import * as THREE from "../../node_modules/three/build/three.module.js";

function clamp01(v) {
    return Math.max(0, Math.min(1, v));
}

function normToNdcX(x) {
    return x * 2 - 1;
}

function normToNdcY(y) {
    return 1 - y * 2;
}

function makeLabelSprite(text) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background pill
    ctx.fillStyle = "rgba(31,31,33,0.85)"; // uses existing premium-grey feel
    ctx.strokeStyle = "rgba(245,245,247,0.55)";
    ctx.lineWidth = 6;

    const pad = 24;
    const r = 34;
    const x = pad;
    const y = 64;
    const w = canvas.width - pad * 2;
    const h = 128;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = "rgba(245,245,247,0.95)";
    ctx.font = "600 42px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, y + h / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.8, 0.4, 1);
    sprite.userData._labelCanvas = canvas;
    sprite.userData._labelCtx = ctx;
    sprite.userData._labelTexture = texture;
    return sprite;
}

function updateLabelSprite(sprite, text) {
    const ctx = sprite.userData._labelCtx;
    const canvas = sprite.userData._labelCanvas;
    const texture = sprite.userData._labelTexture;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(31,31,33,0.85)";
    ctx.strokeStyle = "rgba(245,245,247,0.55)";
    ctx.lineWidth = 6;

    const pad = 24;
    const r = 34;
    const x = pad;
    const y = 64;
    const w = canvas.width - pad * 2;
    const h = 128;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(245,245,247,0.95)";
    ctx.font = "600 42px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const words = (text || "").split(" ");
    let line1 = "", line2 = "";
    for (const w of words) {
        if ((line1 + " " + w).trim().length <= 22) {
            line1 = (line1 + " " + w).trim();
        } else {
            line2 = (line2 + " " + w).trim();
        }
    }
    if (line2) {
        ctx.fillText(line1, canvas.width / 2, y + h / 2 - 22);
        ctx.font = "500 34px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto";
        ctx.fillText(line2.slice(0, 30), canvas.width / 2, y + h / 2 + 24);
    } else {
        ctx.fillText(line1, canvas.width / 2, y + h / 2);
    }

    texture.needsUpdate = true;
}

export function init3DOverlay(canvasEl) {
    const renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: false
    });

    const scene = new THREE.Scene();

    // Ortho camera in NDC-like space: x/y in [-1..1]
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
    camera.position.set(0, 0, 2);
    camera.lookAt(0, 0, 0);

    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(1, 1, 2);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambient);

    const group = new THREE.Group();
    scene.add(group);

    // Only show the 3D overlay when we have a real detection anchor.
    group.visible = false;

    const ringGeo = new THREE.TorusGeometry(0.25, 0.045, 22, 64);
    const ringMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.35,
        metalness: 0.1,
        transparent: true,
        opacity: 0.95
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    const planeGeo = new THREE.PlaneGeometry(0.55, 0.55);
    const planeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.16,
        roughness: 0.8,
        metalness: 0.0,
        side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.position.z = -0.02;
    group.add(plane);

    const label = makeLabelSprite("Ready");
    label.position.set(0, 0.55, 0);
    label.visible = false; // 2D canvas handles the label pill now
    group.add(label);

    let contourLine = null;

    let width = 1;
    let height = 1;

    function resize(w, h) {
        width = w;
        height = h;
        renderer.setSize(w, h, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    }

    let target = {
        leafBox: null,
        leafContour: null,
        color: "rgba(245,245,247,1)",
        labelText: "Ready",
        healthy: null
    };

    function setTarget(next) {
        target = { ...target, ...next };

        // Label handled by 2D canvas overlay; skip 3D label update

        // Update colors
        const isHealthy = !!target.healthy;
        const ringColor = isHealthy ? 0x2ecc71 : 0xe74c3c;
        ringMat.color.setHex(ringColor);
        planeMat.color.setHex(ringColor);

        // Show overlay only when an anchor exists
        group.visible = !!target.leafBox;

        // Update contour
        if (contourLine) {
            group.remove(contourLine);
            contourLine.geometry.dispose();
            contourLine.material.dispose();
            contourLine = null;
        }

        if (
            target.leafBox &&
            Array.isArray(target.leafContour) &&
            target.leafContour.length >= 3
        ) {
            // Build contour in *local* coordinates around the leafBox center.
            const cx = clamp01(target.leafBox.x + target.leafBox.w / 2);
            const cy = clamp01(target.leafBox.y + target.leafBox.h / 2);
            const centerNdcX = normToNdcX(cx);
            const centerNdcY = normToNdcY(cy);

            const points = target.leafContour.map(p => {
                const x = normToNdcX(clamp01(p.x)) - centerNdcX;
                const y = normToNdcY(clamp01(p.y)) - centerNdcY;
                return new THREE.Vector3(x, y, 0);
            });

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: ringColor,
                transparent: true,
                opacity: 0.95
            });

            contourLine = new THREE.LineLoop(geometry, material);
            contourLine.position.z = 0.01;
            group.add(contourLine);
        }
    }

    const clock = new THREE.Clock();

    function tick() {
        const t = clock.getElapsedTime();

        // Determine anchor from leafBox
        const box = target.leafBox;
        if (box && group.visible) {
            const cx = clamp01(box.x + box.w / 2);
            const cy = clamp01(box.y + box.h / 2);

            const ndcX = normToNdcX(cx);
            const ndcY = normToNdcY(cy);

            group.position.x = ndcX;
            group.position.y = ndcY;

            // Scale based on leaf size, add slight depth illusion
            const size = Math.max(0.12, Math.min(0.8, Math.max(box.w, box.h) * 1.35));
            group.scale.set(size, size, size);

            // Keep it stable (avoid "fake" motion).
            group.rotation.z = 0;
            ring.rotation.y = 0;
        }

        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }

    function start() {
        tick();
    }

    function dispose() {
        renderer.dispose();
    }

    return { resize, setTarget, start, dispose };
}
