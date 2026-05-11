export function createCameraView() {

    const video = document.createElement("video");

    video.id = "camera";
    video.autoplay = true;
    video.playsInline = true;

    return video;

}
