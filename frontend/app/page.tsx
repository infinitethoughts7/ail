import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-dvh">
      {/* Full-screen Banner */}
      <div className="absolute inset-0">
        <Image
          src="/banner_image_ail.jpg"
          alt="AI Literacy Program — Empowering Minority Schools"
          fill
          className="object-cover object-[center_35%]"
          priority
          sizes="100vw"
        />
        {/* Lighter gradient — only darken the bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      </div>

      {/* Hero Content — positioned over the laptop area */}
      <div className="relative z-10 flex min-h-dvh flex-col justify-end px-5 pb-[70%] sm:px-6 sm:pb-[15%]">
        <div className="flex flex-col items-center">
          <h1
            className="text-center text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
            style={{
              textShadow:
                "0 2px 20px rgba(0,0,0,0.6), 0 4px 40px rgba(0,0,0,0.3)",
            }}
          >
            AI Literacy
          </h1>
          <p
            className="mt-2 text-center text-base font-medium tracking-wide text-white/90 sm:mt-3 sm:text-xl lg:text-2xl"
            style={{
              textShadow: "0 2px 12px rgba(0,0,0,0.5)",
            }}
          >
            Empowering Minority Schools
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:gap-4">
            <Link
              href="/login"
              className="w-56 rounded-full bg-white px-8 py-3 text-center text-sm font-semibold text-black shadow-lg transition-all active:scale-95 hover:bg-white/90 hover:shadow-xl sm:py-3.5 sm:text-base"
            >
              Get Started
            </Link>
            <Link
              href="/register"
              className="w-56 rounded-full border border-white/30 bg-white/10 px-8 py-3 text-center text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-all active:scale-95 hover:bg-white/20 hover:shadow-xl sm:py-3.5 sm:text-base"
            >
              Register as Trainer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
