import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Layout, Shield } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import UploadPDF from './UploadPDF';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { usePathname } from 'next/navigation';

function Sidebar() {
  const {user}=useUser();
  const filesList=useQuery(api.pdfStorage.GetUserFiles,{
    userEmail:user?.primaryEmailAddress?.emailAddress
  });

  const GetUserInfo=useQuery(api.user.GetUserInfo,{
    userEmail:user?.primaryEmailAddress?.emailAddress
  });

  const path=usePathname();
  return (
    <div className='shadow-md h-screen p-7 w-full'>
      <Link href={'/'}>
      <Image src={"/logo.png"} height={50} width={50} alt='logo' />
      </Link>
      <div className='mt-10'>
        <UploadPDF isMaxFiles={(filesList?.length>=10&&!GetUserInfo.upgrade)?true:false}>
          <Button className='w-full'>+ Upload PDF</Button>
        </UploadPDF>
        <Link href={"/dashboard"}>
        <div 
        className={`flex gap-2 items-center p-3 mt-5 hover:bg-slate-100 hover:rounded-lg cursor-pointer ${path=='/dashboard'&&'bg-slate-200'}`}>
          <Layout />
          <h2>WorkSpace</h2>
        </div>
        </Link>
        <Link href={"/dashboard/upgrade"}>
        <div 
        className={`flex gap-2 items-center p-3 mt-1 hover:bg-slate-100 hover:rounded-lg cursor-pointer ${path=='/dashboard/upgrade'&&'bg-slate-200'}`}>
          <Shield />
          <h2>Upgrade</h2>
        </div>
        </Link>
      </div>
      {!GetUserInfo?.upgrade&&<div className='absolute bottom-24 w-[80%]'>
        <Progress value={filesList?.length>0?(filesList.length/10)*100:0} />
        <p className='mt-1 text-sm'>{filesList?.length} Out Of 10 Pdfs Uploaded!</p>
        <p className='mt-2 text-gray-400 text-sm'>Upgrade to Upload more Pdfs</p>
      </div>
      }
    </div>
  );
}

export default Sidebar;
