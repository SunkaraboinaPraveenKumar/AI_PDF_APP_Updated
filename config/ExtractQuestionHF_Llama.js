const convertImageToBase64 = (imageFile) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
    });
};

const stripBase64Prefix = (base64) => {
    return base64.split(',')[1];
};

const resizeImage = (file, maxWidth = 500, maxHeight = 500) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        img.onload = () => {
            const ctx = canvas.getContext('2d');
            let { width, height } = img;

            if (width > maxWidth || height > maxHeight) {
                if (width > height) {
                    height *= maxWidth / width;
                    width = maxWidth;
                } else {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.7);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};

export const extractQuestionFromImage = async (imageFile) => {
    try {
        // Resize image to reduce token count
        const compressedImage = await resizeImage(imageFile);
        const base64Image = await convertImageToBase64(compressedImage);
        const strippedBase64 = stripBase64Prefix(base64Image);

        const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-11B-Vision-Instruct", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                inputs: strippedBase64,
                parameters: { max_new_tokens: 50 } // Adjust token limit if needed
            })
        });

        const data = await response.json();

        console.log(data);
        if (!response.ok) {
            console.error("API Error Response:", data);
            throw new Error(data.error || "Failed to process image");
        }

        return data.choices?.[0]?.message?.content || "No response from the model";
    } catch (error) {
        console.error("Error extracting text from image:", error);
        throw new Error("Failed to extract text from the image.");
    }
};
