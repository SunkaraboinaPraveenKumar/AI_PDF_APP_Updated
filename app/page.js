"use client"
import { api } from "@/convex/_generated/api";
import {  useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import Header from "./_components/Header";
import Hero from "./_components/Hero";

export default function Home() {
  const { user } = useUser();
  const createUser = useMutation(api.user.createUser);
  const checkUser = async () => {
    const result = await createUser({
      email: user?.primaryEmailAddress?.emailAddress,
      imageUrl: user?.imageUrl,
      userName: user?.fullName,
      upgrade:false
    });

    console.log(result);
  }
  useEffect(() => {
    user && checkUser();
  }, [user])
  return (
    <div>
      {/* Header */}
      <Header />
      {/* Hero Section */}
      <Hero />
    </div>
  );
}
