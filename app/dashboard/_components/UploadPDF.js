"use client"
import React, { useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Loader, Maximize, UploadCloud } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAction, useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import uuid4 from 'uuid4'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'

function UploadPDF({ children,isMaxFiles }) {
    const generateUploadUrl = useMutation(api.pdfStorage.generateUploadUrl);
    const getFileUrl=useMutation(api.pdfStorage.getFileUrl);
    const addFileEntry=useMutation(api.pdfStorage.AddFileEntryToDb);
    const embeddDocument=useAction(api.myAction.ingest);
    const [file, setFile] = useState();
    const {user}=useUser();
    const [loading, setLoading] = useState(false);
    const [fileName,setFileName]=useState();
    const [open,setOpen]=useState(false);
    const onFileSelect = (event) => {
        setFile(event.target.files[0]);
    }
    const GetUserInfo=useQuery(api.user.GetUserInfo,{
        userEmail:user?.primaryEmailAddress?.emailAddress
      });
    const onUpload = async () => {
        if(isMaxFiles&&!GetUserInfo.upgrade){
            toast('Sorry Please Upgrade! Free Trail is Over!!');
            return;
        }
        setLoading(true);

        const postUrl = await generateUploadUrl();

        const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": file?.type },
            body: file,
        });
        const { storageId } = await result.json();

        const fileId=uuid4();
        // Step 3: Save the newly allocated storage id to the database

        const fileUrl=await getFileUrl({storageId:storageId});
        const resp=await addFileEntry({
            fileId:fileId,
            storageId:storageId,
            fileName:fileName??'Untitled File',
            fileUrl:fileUrl,
            createdBy:user?.primaryEmailAddress?.emailAddress
        })

        // API call to fetch pdf process data
        const apiResp=await axios.get('/api/pdf-loader?pdfUrl='+fileUrl);
        await embeddDocument({
            splitText:apiResp.data.result,
            fileId:fileId
        });
        setLoading(false);
        setOpen(false);
        toast('PDF uploaded Successfully and ready!!')
    }
    return (
        <Dialog open={open}>
            <DialogTrigger asChild>
                <Button onClick={()=>setOpen(true)} className='w-full' disabled={isMaxFiles}>+ Upload PDF File</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='flex gap-2'><UploadCloud />Upload PDF File</DialogTitle>
                    <DialogDescription asChild>
                        <div className=''>
                            <h2 className='mt-5'>Select a file to Upload</h2>
                            <div className='gap-2 p-3 rounded-md border'>
                                <input type='file' accept='application/pdf'
                                    onChange={(event) => onFileSelect(event)}
                                />
                            </div>
                            <div className='mt-2'>
                                <label>File Name*</label>
                                <Input placeholder='File Name' onChange={(e)=>setFileName(e.target.value)} />
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className='sm:justify-end gap-2'>
                    <DialogClose asChild>
                        <Button type="button" variant='secondary' onClick={()=>setOpen(false)}>
                            Close
                        </Button>
                    </DialogClose>
                    <Button onClick={onUpload} disabled={loading}>
                        {
                            loading ?
                                <Loader className='animate-spin' />
                                :
                                'Upload'
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    )
}

export default UploadPDF