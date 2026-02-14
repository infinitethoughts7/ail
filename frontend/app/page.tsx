import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-8 text-4xl font-bold">AI Literacy Platform</h1>
      <Link href="/login">
        <Button size="lg">Login</Button>
      </Link>
    </div>
  );
}
