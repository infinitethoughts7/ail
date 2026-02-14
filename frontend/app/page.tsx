import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="mb-6 text-center text-3xl font-bold sm:mb-8 sm:text-4xl">
        AI Literacy Platform
      </h1>
      <Link href="/login">
        <Button size="lg" className="w-full sm:w-auto">Login</Button>
      </Link>
    </div>
  );
}
