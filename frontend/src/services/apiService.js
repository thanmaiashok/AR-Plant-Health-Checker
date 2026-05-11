const API_URL = "http://127.0.0.1:5001/predict";

export async function sendImageToAPI(imageBlob) {

    const formData = new FormData();
    // Provide a filename so Flask gets a non-empty `file.filename`.
    formData.append("image", imageBlob, "capture.jpg");

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        return data;

    } catch (error) {

        console.error("API Error:", error);

        return {
            disease: "Unknown",
            confidence: 0
        };

    }

}
