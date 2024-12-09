"use client"
import { chatSession } from '@/config/AIModel';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useAction, useMutation } from 'convex/react';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  CodeIcon,
  ListIcon,
  TypeIcon,
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  DropletIcon,
  PenIcon,
  Highlighter,
  Sparkles,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

function EditorExtensions({ editor }) {
  const {user}=useUser();
  const {fileId}=useParams();
  const searchAI=useAction(api.myAction.search);
  const saveNotes=useMutation(api.notes.AddNotes);
  const onAIClick=async()=>{
    toast("AI is Getting Your Answer....")
    const selectedText=editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );

    const result=await searchAI({
      query:selectedText,
      fileId:fileId
    })

    const unformattedAnswer=JSON.parse(result);

    let AllUnformattedanswer=''

    unformattedAnswer&&unformattedAnswer.forEach((item)=>{
      AllUnformattedanswer=AllUnformattedanswer+item.pageContent
    })


    const PROMPT = `For the question: "${selectedText}" and using the content provided, please generate a direct HTML response without any code formatting or code block tags. Answer content: "${AllUnformattedanswer}"`;

    const aiResult=await chatSession.sendMessage(PROMPT);

    const finalAns=aiResult.response.text().replace('```','').replace('hmtl','');

    const allText=editor.getHTML();
    editor.commands.setContent(allText+'<p><strong>Answer: </strong>'+finalAns+'</p>')

    saveNotes({
      notes:editor.getHTML(),
      fileId:fileId,
      createdBy:user?.primaryEmailAddress?.emailAddress
    })
    
  }
  return editor && (
    <div className='p-5 flex gap-3 flex-wrap'>
      {/* H1 */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 ${editor.isActive('heading', { level: 1 }) ? 'text-blue-500' : ''}`}
      >
        H1
      </button>

      {/* H2 */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 ${editor.isActive('heading', { level: 2 }) ? 'text-blue-500' : ''}`}
      >
        H2
      </button>

      {/* H3 */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 ${editor.isActive('heading', { level: 3 }) ? 'text-blue-500' : ''}`}
      >
        H3
      </button>

      {/* Bold */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 ${editor.isActive('bold') ? 'text-blue-500' : ''}`}
      >
        <BoldIcon />
      </button>

      {/* Italic */}
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 ${editor.isActive('italic') ? 'text-blue-500' : ''}`}
      >
        <ItalicIcon />
      </button>

      {/* Underline */}
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'is-active' : ''}
      >
        <UnderlineIcon />
      </button>

      {/* Code */}
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? 'text-blue-500' : ''}
      >
        <CodeIcon />
      </button>

      {/* Bullet List */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 ${editor.isActive('bulletList') ? 'text-blue-500' : ''}`}
      >
        <ListIcon />
      </button>

      {/* Text Alignment */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 ${editor.isActive({ textAlign: 'left' }) ? 'text-blue-500' : ''}`}
      >
        <AlignLeftIcon />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 ${editor.isActive({ textAlign: 'center' }) ? 'text-blue-500' : ''}`}
      >
        <AlignCenterIcon />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 ${editor.isActive({ textAlign: 'right' }) ? 'text-blue-500' : ''}`}
      >
        <AlignRightIcon />
      </button>

      {/* Text Color */}
      {/* Highlight */}
      <button
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#FFFF00' }).run()} // Example with yellow highlight
        className={`p-2 ${editor.isActive('highlight') ? 'text-blue-500' : ''}`}
      >
        <Highlighter />
      </button>

      <button
        onClick={() => onAIClick()}
        className='hover:text-blue-500'
      >
        <Sparkles />
      </button>
    </div>
  );
}

export default EditorExtensions;
