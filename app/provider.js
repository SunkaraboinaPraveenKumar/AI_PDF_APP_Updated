"use client"
import React from 'react'
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider } from '@clerk/nextjs';

function Provider({ children }) {
    const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    return (
        <div>
            <ClerkProvider>
                <ConvexProvider client={convex}>
                    {children}
                </ConvexProvider>
            </ClerkProvider>
        </div>
    )
}

export default Provider