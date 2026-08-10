"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; 
import { Sparkles, ArrowRight, Play, CheckCircle2, Zap, Film } from "lucide-react";
import Link from "next/link";

// Define your carousel images here
const CAROUSEL_IMAGES = [
  { src: "/images/bg-1.avif", alt: "REAM Studio - Reel Editor" },
  { src: "/images/bg-3.avif", alt: "AI Script Generation" },
  { src: "/images/bg-5.avif", alt: "Frame-by-Frame Timeline" },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT SIDE: Content */}
          <div className="max-w-2xl text-start">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4" />
              AI-Powered Short-Form Video
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight">
              Turn Ideas Into
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"> Viral Reels</span>
              <br />
              <span className="bg-gradient-to-r from-primary/80 to-primary/40 bg-clip-text text-transparent">Automatically</span>
            </h1>

            <p className="text-xl text-foreground/70 max-w-xl mb-10 leading-relaxed">
              REAM generates scroll-stopping short-form videos end-to-end — AI script, voiceover, scene images, background music, and final render — all from a single prompt.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-start mb-12">
              <Link href="/auth/signup">
                <Button size="lg" className="h-10! w-full! md:h-11! lg:h-14! bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8">
                  <Film className="mr-2 h-5 w-5" />
                  Create Your First Reel
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-10! md:h-11! lg:h-14! text-lg px-8 border-2">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-wrap justify-start gap-8 text-sm">
              {[
                "AI script generation",
                "12 voice options",
                "Auto background music",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: Auto-Rotating Carousel */}
          <div className="relative hidden lg:block group">
            {/* Decorative glow behind carousel */}
            <div className="absolute -inset-4 bg-primary/20 rounded-2xl blur-2xl opacity-50 transition-opacity duration-700" />
            
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] bg-muted/20">
              {CAROUSEL_IMAGES.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay for better blending */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-background/20 to-transparent pointer-events-none" />
                </div>
              ))}

              {/* Navigation Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {CAROUSEL_IMAGES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "w-8 bg-primary"
                        : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}