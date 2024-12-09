const { extractQuestionFromImage } = require("@/config/ExtractQuestionAI");

const handleImageUpload = async (file) => {
    setImage(file);
    try {
        toast("Extracting content from the image...");
        const extractedQuestion = await extractQuestionFromImage(file); // Call Together AI extraction
        setMessages((prev) => [
            ...prev,
            { role: 'user', content: extractedQuestion }, // Display the extracted question
        ]);

        // Optionally, trigger a chat response using the extracted question
        toast("AI is generating a response...");
        const aiResponse = await generateChatResponse(extractedQuestion); // Generate response
        setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: aiResponse },
        ]);

        toast("Response generated!");
    } catch (error) {
        console.error("Error extracting text from the image:", error);
        toast("Failed to extract question from the image.");
    }
};
