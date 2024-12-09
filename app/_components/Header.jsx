import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Header() {
  return (
    <div className='flex justify-between p-5 shadow-md'>
        <Link href={'/'}>
        <Image src={"/logo.png"} width={50} height={50} alt='logo'/>
        </Link>
        <Link href={'/dashboard'}>
        <Button>Get Started</Button>
        </Link>
    </div>
  )
}

export default Header