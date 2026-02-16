import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-dvh">
      {/* Top Nav — Login button */}
      <nav className="absolute left-0 right-0 top-0 z-20 flex items-center justify-end px-4 py-3 sm:px-10 sm:py-6">
        <Link
          href="/login"
          className="rounded-full bg-white/15 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-all active:scale-95 hover:bg-white/25"
        >
          Login
        </Link>
      </nav>

      {/* Full-screen Banner */}
      <div className="absolute inset-0">
        <Image
          src="/ail_banner_3.png"
          alt="AI Literacy Program — Empowering Minority Schools"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Hero Title */}
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 sm:px-6">
        <h1
          className="text-center text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
          style={{
            textShadow:
              "0 2px 16px rgba(0,0,0,0.5), 0 4px 40px rgba(0,0,0,0.3)",
          }}
        >
          AI Literacy
        </h1>
        <p
          className="mt-2 text-center text-base font-medium tracking-wide text-white/80 sm:mt-4 sm:text-xl lg:text-2xl"
          style={{
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
          }}
        >
          Empowering Minority Schools
        </p>
        <Link
          href="/login"
          className="mt-6 rounded-full bg-white px-8 py-3 text-sm font-semibold text-black shadow-lg transition-all active:scale-95 hover:bg-white/90 hover:shadow-xl sm:mt-10 sm:px-10 sm:py-3.5 sm:text-base"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
