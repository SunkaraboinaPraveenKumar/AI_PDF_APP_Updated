import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import EditorExtensions from './EditorExtensions';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';

const TextEditor = forwardRef(({ fileId, onSave }, ref) => {
    const { user } = useUser(); // Retrieve user info
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start taking your notes here...',
            }),
            TextAlign.configure({
                types: ['paragraph', 'heading'],
            }),
            Underline,
            Color,
            Highlight,
        ],
        editorProps: {
            attributes: {
                class: 'focus:outline-none h-screen p-5',
            },
        },
    });

    const notes = useQuery(api.notes.GetNotes, { fileId });
    const saveNotes = useMutation(api.notes.AddNotes);

    useEffect(() => {
        if (notes && editor) {
            editor.commands.setContent(notes);
        }
    }, [notes, editor]);

    const handleSave = () => {
        if (editor && user) {
            saveNotes({
                notes: editor.getHTML(),
                fileId,
                createdBy: user.primaryEmailAddress?.emailAddress, // Ensure user info is available
            });
        }
    };

    // Expose the getHTML method to the parent component
    useImperativeHandle(ref, () => ({
        getHTML: () => editor?.getHTML() || '',
    }));

    // Pass handleSave to the parent
    useEffect(() => {
        if (onSave) {
            onSave(handleSave);
        }
    }, [onSave, handleSave]);

    return (
        <div>
            <EditorExtensions editor={editor} />
            <div className='overflow-scroll h-[88vh]'>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
});

export default TextEditor;
