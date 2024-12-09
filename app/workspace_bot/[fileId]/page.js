"use client"
import React, { useState } from 'react';
import ChatInterface from '../_components/ChatInterface_Together_Llama';
import WorkSpaceHeader from '../_components/WorkSpaceHeader';
import PdfViewer from '../_components/PdfViewer';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function WorkSpace() {
  const { fileId } = useParams();
  const fileInfo = useQuery(api.pdfStorage.GetFileRecord, { fileId });
  const [messages, setMessages] = useState([]);

  return (
    <div>
      <WorkSpaceHeader fileName={fileInfo?.fileName} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <ChatInterface messages={messages} setMessages={setMessages} />
        </div>
        <div>
          <PdfViewer fileUrl={fileInfo?.fileUrl} />
        </div>
      </div>
    </div>
  );
}

export default WorkSpace;
