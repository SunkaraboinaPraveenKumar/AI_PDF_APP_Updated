import React, { useState, useEffect, useRef } from "react";
import { chatSession } from "@/config/AIModel";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useAction } from "convex/react";
import { Button } from "@/components/ui/button";
import axios from "axios";

function ChatInterface({ messages, setMessages }) {
    const [input, setInput] = useState("");
    const [imagePath, setImagePath] = useState(""); // Store image path
    const [isExtracting, setIsExtracting] = useState(false); // Track extraction process
    const [extractedImageText, setExtractedImageText] = useState(""); // Store extracted text
    const { fileId } = useParams();
    const searchAI = useAction(api.myAction.search);

    const chatContainerRef = useRef(null);
    const messageEndRef = useRef(null);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if ((!input.trim() && !extractedImageText) || isExtracting) return;

        const newMessages = [];
        if (extractedImageText) {
            newMessages.push({ role: "user", content: extractedImageText });
        }

        if (input.trim()) {
            newMessages.push({ role: "user", content: input });
        }

        setMessages((prev) => [...prev, ...newMessages]);

        try {
            toast("AI is generating a response...");
            const result = await searchAI({ query: input, fileId });
            const unformattedAnswer = JSON.parse(result);
            let combinedText = unformattedAnswer.map((item) => item.pageContent).join(" ");
            console.log(combinedText);

            const fullPrompt = `
                Extracted Image Text: "${extractedImageText || "N/A"}"
                User Input: "${input}"
                Relevant Content: "${combinedText}"
                Generate a fairly enough explanation based on context and
                Extracted Image Text and User Input in HTML ignore if extracted Image Text not available just use  User Input and Relevant Content:
            `;

            const aiResult = await chatSession.sendMessage(fullPrompt);
            let cleanResponse = aiResult.response.text();

            cleanResponse = cleanResponse.replace(/^```html/i, "").replace(/html$/i, "").replace(/^```/i, "").replace(/```$/i, "").replace(/<\/?[^>]+(>|$)/g, "").trim();
            cleanResponse = cleanResponse.slice(0, cleanResponse.length - 3);

            const aiMessage = {
                role: "assistant",
                content: cleanResponse,
            };

            setMessages((prev) => [...prev, aiMessage]);
            toast("Response generated!");
        } catch (error) {
            console.error("Failed to generate response:", error);
            toast("Error generating response.");
        }

        setInput("");
        setImagePath(""); // Reset image path
        setExtractedImageText(""); // Clear extracted text after sending
    };

    const handleImagePathSubmit = async () => {
        if (!imagePath) return; // Ensure there's a path before continuing
    
        setExtractedImageText(""); // Reset extracted text for new image
        setIsExtracting(true); // Set extracting state to true
    
        // Clean up the image path (remove unwanted characters)
        const cleanImagePath = imagePath.replace(/^"|"$/g, '').trim();
    
        try {
            toast("Extracting content from the image...");
            const ocrResponse = await axios.post("/api/ocr", { imagePath: cleanImagePath });
            console.log(ocrResponse);
            setExtractedImageText(ocrResponse.data.result);
            toast("Content extracted successfully!");
        } catch (error) {
            console.error("Error extracting text from the image:", error);
            toast("Failed to extract question from the image.");
        } finally {
            setIsExtracting(false); // Set extracting state to false
        }
    };
    

    return (
        <div className="flex flex-col max-w-3xl mx-auto p-4 bg-white rounded-lg shadow-lg h-full">
            <div className="flex-grow overflow-y-auto mb-4 max-h-[400px]" ref={chatContainerRef}>
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role === "user" ? "bg-blue-100" : "bg-gray-100"} p-3 rounded-lg max-w-sm`}>
                            <p>{msg.content}</p>
                        </div>
                    ))}
                    <div ref={messageEndRef} />
                </div>
            </div>

            <div className="input-section flex flex-col gap-4 mb-7">
                <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows="4"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                />

                <div className="flex justify-between items-center gap-2">
                    <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={imagePath}
                        onChange={(e) => setImagePath(e.target.value)}
                        placeholder="Enter image path or URL"
                    />
                    <Button
                        onClick={handleImagePathSubmit}
                        className="bg-blue-500 text-white p-3 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
                        disabled={isExtracting}
                    >
                        {isExtracting ? "Extracting..." : "Extract Text"}
                    </Button>
                    <Button
                        onClick={handleSendMessage}
                        className="bg-green-500 text-white p-3 rounded-lg shadow-md hover:bg-green-600 focus:outline-none"
                        disabled={isExtracting}
                    >
                        {isExtracting ? "Extracting..." : "Send"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ChatInterface;
