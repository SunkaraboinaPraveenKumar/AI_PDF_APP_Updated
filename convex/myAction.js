import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { action } from "./_generated/server.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { v } from "convex/values";

export const ingest = action({
    args: {
        splitText: v.any(),
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        await ConvexVectorStore.fromTexts(
            args.splitText,//Array
            args.fileId,//String
            new GoogleGenerativeAIEmbeddings({
                apiKey: 'AIzaSyCyt4M5nw7tHsM8gMlA61Oq10K23Lf5z4E',
                model: "text-embedding-004", // 768 dimensions
                taskType: TaskType.RETRIEVAL_DOCUMENT,
                title: "Document title",
            }),
            { ctx }
        )
        return 'Completed...'
    },
});


export const search = action({
    args: {
        query: v.string(),
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        const vectorStore = new ConvexVectorStore(
            new GoogleGenerativeAIEmbeddings({
                apiKey: 'AIzaSyCyt4M5nw7tHsM8gMlA61Oq10K23Lf5z4E',
                model: "text-embedding-004", // 768 dimensions
                taskType: TaskType.RETRIEVAL_DOCUMENT,
                title: "Document title",
            }),
            { ctx }
        );

        // Run similarity search and filter results by fileId
        const resultOne = (await vectorStore.similaritySearch(args.query, 10))
            .filter((q) => {
                const metadataString = typeof q.metadata === 'object' ? Object.values(q.metadata).join('') : q.metadata;
                return metadataString === args.fileId;
            })
            .map((q) => {
                // Convert metadata to concatenated string format for each result
                const formattedMetadata = typeof q.metadata === 'object' ? Object.values(q.metadata).join('') : q.metadata;
                return {
                    ...q,
                    metadata: formattedMetadata
                };
            });
        return JSON.stringify(resultOne);
    },
});

