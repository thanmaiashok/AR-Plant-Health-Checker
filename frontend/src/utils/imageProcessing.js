export function resizeImage(canvas, width = 224, height = 224) {

    const resizedCanvas = document.createElement("canvas");

    resizedCanvas.width = width;
    resizedCanvas.height = height;

    const ctx = resizedCanvas.getContext("2d");

    ctx.drawImage(canvas, 0, 0, width, height);

    return resizedCanvas;

}
