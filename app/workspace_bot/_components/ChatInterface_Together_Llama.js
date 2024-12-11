import React, { useState, useEffect, useRef } from "react";
import { chatSession } from "@/config/AIModel";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useAction } from "convex/react";
import { storage } from "@/config/firebase";
import { getDownloadURL, ref, uploadBytesResumable, deleteObject } from "firebase/storage";
import axios from "axios";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AudioLinesIcon, Mic } from "lucide-react";

function ChatInterface({ messages, setMessages }) {
    const [input, setInput] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [extractedImageText, setExtractedImageText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadedImageRef, setUploadedImageRef] = useState(null); // Store Firebase image reference
    const { fileId } = useParams();
    const searchAI = useAction(api.myAction.search);

    const chatContainerRef = useRef(null);
    const messageEndRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

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
                Extracted Image Text and User Input in HTML ignore if extracted Image Text not available just use User Input and Relevant Content:
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
        setExtractedImageText("");
        setImagePreview(null);

        // Delete the image from Firebase after sending the message
        if (uploadedImageRef) {
            try {
                await deleteObject(uploadedImageRef);
                console.log("Image deleted from Firebase.");
            } catch (error) {
                console.error("Failed to delete image:", error);
            }
            setUploadedImageRef(null);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsExtracting(true);
        setExtractedImageText("");
        setImagePreview(URL.createObjectURL(file));

        try {
            toast("Uploading image...");

            const storageRef = ref(storage, `uploaded-images/${Date.now()}_${file.name}`);
            setUploadedImageRef(storageRef); // Store reference for later deletion
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                null,
                (error) => {
                    console.error("Error uploading image:", error);
                    toast("Failed to upload image.");
                    setIsExtracting(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log("Image uploaded successfully:", downloadURL);

                    toast("Extracting content from the image...");
                    const ocrResponse = await axios.post("/api/ocr", { imagePath: downloadURL });
                    setExtractedImageText(ocrResponse.data.result);

                    toast("Content extracted successfully!");
                }
            );
        } catch (error) {
            console.error("Error handling image upload:", error);
            toast("Failed to extract text from the image.");
        } finally {
            setIsExtracting(false);
        }
    };

    const startRecording = () => {
        setIsRecording(true);
        audioChunksRef.current = [];
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = handleAudioStop;
            mediaRecorderRef.current.start();
        });
    };

    const stopRecording = () => {
        setIsRecording(false);
        mediaRecorderRef.current?.stop();
    };

    const handleAudioStop = async () => {
        if (!audioChunksRef.current || audioChunksRef.current.length === 0) {
            toast("Please record something before stopping!");
            return;
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });

    
        toast("Transcribing voice...");
        const formData = new FormData();
        formData.append("file", audioFile);
    
        try {
            const response = await axios.post("/api/voice-to-text", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
    
            if (response.status === 200) {
                setInput(response.data.transcription);
                toast("Voice transcription completed!");
            } else {
                toast("Failed to transcribe voice: " + (response.data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error transcribing voice:", error);
            toast("Failed to transcribe voice.");
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
                {imagePreview && (
                    <div className="image-preview mb-4">
                        <img src={imagePreview} alt="Uploaded preview" className="w-32 h-32 object-cover rounded-lg" />
                    </div>
                )}
                <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows="4"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    disabled={isExtracting}
                />

                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="upload-image"
                    />
                    <label htmlFor="upload-image" className="bg-blue-500 text-white p-3 rounded-lg cursor-pointer">
                        <Image src={'/upload.png'} height={25} width={30} alt="upload" />
                    </label>
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-3 rounded-lg shadow-md text-white ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-yellow-500 hover:bg-yellow-600"}`}
                    >
                        {isRecording ? 
                        <AudioLinesIcon/>
                        :
                        <Mic/>
                        }
                    </button>
                    <button
                        onClick={handleSendMessage}
                        className="bg-green-500 text-white p-3 rounded-lg shadow-md hover:bg-green-600 focus:outline-none"
                        disabled={isExtracting}
                    >
                        {isExtracting ? "Extracting..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatInterface;
