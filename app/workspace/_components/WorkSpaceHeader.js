import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

function WorkSpaceHeader({ fileName, onSave }) {
  return (
    <div className='p-4 flex justify-between shadow-md'>
      <Link href={"/dashboard"}>
      <Image src={"/logo.png"} width={50} height={50} alt='logo' />
      </Link>
      <h2 className='font-bold'>{fileName}</h2>
      <div className='flex gap-2 items-center'>
        <Button onClick={onSave}>Save</Button>
      </div>
      <UserButton />
    </div>
  );
}

export default WorkSpaceHeader;
