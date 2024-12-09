import { UserButton } from '@clerk/nextjs';
import React from 'react';

function Header() {
  return (
    <div className='flex justify-end w-full p-2'>
      <UserButton />
    </div>
  );
}

export default Header;
