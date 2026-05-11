export async function startCamera(videoElement) {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        videoElement.srcObject = stream;

    } catch (error) {

        console.error("Camera access denied", error);

    }

}
