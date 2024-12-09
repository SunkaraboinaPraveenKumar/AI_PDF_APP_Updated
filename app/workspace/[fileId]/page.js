"use client"
import { useParams } from 'next/navigation';
import React, { useRef } from 'react';
import WorkSpaceHeader from '../_components/WorkSpaceHeader';
import PdfViewer from '../_components/PdfViewer';
import { useMutation, useQuery } from 'convex/react';
import TextEditor from '../_components/TextEditor';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';

function WorkSpace() {
    const { user } = useUser();
    const { fileId } = useParams();
    const fileInfo = useQuery(api.pdfStorage.GetFileRecord, { fileId });
    const editorRef = useRef(null); // Create a ref for the editor

    const saveNotes = useMutation(api.notes.AddNotes);
    
    // Save content handler to be passed to WorkSpaceHeader
    const handleSave = async () => {
        try {
            await saveNotes({
                notes: editorRef.current.getHTML(), // Use the ref to get HTML
                fileId: fileId,
                createdBy: user?.primaryEmailAddress?.emailAddress,
            });
            toast("Notes saved successfully!");
        } catch (error) {
            console.error("Failed to save notes:", error);
            toast("Error saving notes. Please try again.");
        }
    };

    return (
        <div>
            <WorkSpaceHeader fileName={fileInfo?.fileName} onSave={handleSave} />
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
                {/* Text Editor */}
                <div>
                    <TextEditor ref={editorRef} fileId={fileId} />
                </div>
                {/* Pdf Viewer */}
                <div>
                    <PdfViewer fileUrl={fileInfo?.fileUrl} />
                </div>
            </div>
        </div>
    );
}

export default WorkSpace;
