export const extractQuestionFromImage = async (file) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
  
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          const base64Image = reader.result.split(",")[1]; // Get only Base64 content
  
          try {
            const response = await fetch(
              "https://api-inference.huggingface.co/models/facebook/nougat-base",
              {
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
                  "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: base64Image }),
              }
            );
  
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ detail: response.statusText }));
              console.error("Hugging Face API error:", errorData);
              reject(`API Error: ${errorData?.detail || "Unknown error"}`);
              return;
            }
  
            const result = await response.json();
  
            // Adjusted to handle the specific structure of your API response
            const extractedText =
              result[0]?.generated_text || "No text extracted"; // Safely access the first item's `generated_text`
  
            console.log("Extracted Text:", extractedText);
            resolve(extractedText);
          } catch (error) {
            console.error("Error extracting text from the image:", error);
            reject("Failed to extract text from the image.");
          }
        };
  
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
          reject("Error reading image file.");
        };
      });
    } catch (error) {
      console.error("Error extracting question from image:", error);
      throw new Error("An error occurred while extracting text from the image.");
    }
  };
  