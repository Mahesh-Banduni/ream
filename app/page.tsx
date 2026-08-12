import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Users, 
  BarChart3, 
  Globe, 
  Play, 
  Sparkles,
  ChevronRight,
  Mail,
  Menu,
  X,
  CheckCircle2,
  Star,
  Clock,
  Award,
  TrendingUp,
  Layers,
  Cpu,
  Cloud,
  Lock,
  LineChart,
  Film,
  Mic,
  Music2,
  Video,
  RefreshCw,
  Sliders,
  Wand2
} from "lucide-react";
import { Metadata } from "next";
import HeroSection from "@/components/home/hero";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export const metadata: Metadata = {
  title: "REAM — Automated Short-Form Video & Reel Generation Platform",
  description: "Real-time AI-powered short-form video creation platform with scriptwriting, voiceover synthesis, image asset sourcing, background music & video rendering.",
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="mb-2 font-heading text-xl font-bold tracking-tight text-card-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
  </div>
);

const ReelCard = ({ 
  videoUrl, 
  title,
}: { 
  videoUrl: string; 
  title: string; 
}) => (
  <div className="group relative flex-shrink-0 snap-center overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 w-[280px] md:w-[320px] aspect-[9/16]">
    {/* Video Content Background */}
    <video
      className="absolute inset-0 h-full w-full object-cover"
      src={videoUrl}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
    />
    
    {/* Overlay Gradient for Text Readability */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

    {/* Bottom Metadata */}
    <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
      <h4 className="font-heading text-lg font-semibold text-white leading-tight mb-1">{title}</h4>
    </div>

    {/* Top Right AI Badge */}
    <div className="absolute top-4 right-4">
      <div className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md border border-white/10">
        <Sparkles className="h-3 w-3 text-primary" />
        AI Generated
      </div>
    </div>
  </div>
);

const reelData = [
  { videoUrl: "/videos/video-1.mp4", title: "Luxury Villas That Redefine Living" },
  { videoUrl: "/videos/video-3.mp4", title: "Why Clients Disappear After Seeing Your Proposal" },
  { videoUrl: "/videos/video-9.mp4", title: "Your Ride, Anytime, Anywhere | Fast, Safe & Reliable" },
  { videoUrl: "/videos/video-6.mp4", title: "Pure from the Himalayas | Organic Natural Foods"},
  { videoUrl: "/videos/video-7.mp4", title: "Make Every Journey an Unforgettable Memory" },
  { videoUrl: "/videos/video-2.mp4", title: "Shoes Designed for Every Step You Take" },
  { videoUrl: "/videos/video-8.mp4", title: "Discover India's Finest Premium Traditional Designer Clothing" },
  { videoUrl: "/videos/video-4.mp4", title: "Why Your AI Agency Isn't Getting Enterprise Clients" },
  { videoUrl: "/videos/video-5.mp4", title: "AI Utilization in DevOps & Application Deployment" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15 md:h-21">
            <div className="flex items-center gap-2">
              <a href="/" className="w-18 md:w-26 h-14 md:h-20 flex items-center justify-center relative px-5">
                <Image
                  src="/images/logo.png"
                  alt="REAM"
                  fill
                  className="object-contain w-full"
                  priority
                />
              </a>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#reels" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Reels Showcase</a>
              <a href="#platform" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Features</a>
              <a href="#workflow" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Workflow</a>
            </div>

            <div className="flex items-center gap-1 md:gap-4">
              <ThemeToggle />
              <Link href="/auth/signin"><Button variant="ghost" className="hidden md:inline-flex">Sign In</Button></Link>
              <Link href="/auth/signup">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <HeroSection />

      {/* Stats Section */}
      <section className="py-12 border-y border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10x", label: "Faster Content Pipeline", icon: Zap },
              { number: "12+", label: "Realistic AI Voices", icon: Mic },
              { number: "100%", label: "Automated Rendering", icon: Film },
              { number: "4.9★", label: "Creator Rating", icon: Star },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-heading font-bold">{stat.number}</span>
                </div>
                <p className="text-sm text-foreground/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portrait Reels Showcase Section */}
      <section id="reels" className="py-16 md:py-24 border-b border-border bg-muted/20">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Showcase</Badge>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              AI-Generated Reels
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Scroll-stopping 9:16 short-form videos synthesized with tailored scripts, voiceovers, visual assets & background tracks.
            </p>
          </div>
          <Link href="/auth/signup">
            <Button variant="ghost" className="hidden md:inline-flex group">
              Create Your Reel 
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="w-full overflow-x-auto pb-8 pt-2 scrollbar-none">
          <div className="flex gap-6 px-4 md:px-6 snap-x snap-mandatory min-w-max mx-auto justify-start md:justify-center">
            {reelData.map((reel, index) => (
              <ReelCard 
                key={index}
                videoUrl={reel.videoUrl}
                title={reel.title}
              />
            ))}
          </div>
        </div>
        
        <div className="mt-6 text-center md:hidden">
          <Link href="/auth/signup">
            <Button variant="ghost" className="w-full">
              Create Your Reel 
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section id="platform" className="border-b border-border bg-muted/30 py-24 md:py-32">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-16 text-center">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Platform Power</Badge>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              End-to-End Automated Reel Creation
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to turn a single topic or prompt into a fully edited, high-engagement video ready for Instagram, TikTok, and Shorts.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard 
              icon={Wand2}
              title="AI Script Generator"
              description="Crafts high-converting script structures (Hook, Body, Ending) with custom tone controls and target audience guardrails."
            />
            <FeatureCard 
              icon={Mic}
              title="Diverse AI Voices"
              description="Choose from 12+ natural male & female voice styles (Aditya, Shubh, Ratan, Ritu, Priya, and more) for perfect narration."
            />
            <FeatureCard 
              icon={Music2}
              title="Smart Background Audio"
              description="Automatically queries Jamendo and Freesound to match your reel's exact mood, tone, and energy."
            />
            <FeatureCard 
              icon={Sliders}
              title="Studio Reel Editor"
              description="Interactive timeline inspector to adjust frames, fine-tune voiceovers, swap images, and preview video assets live."
            />
            <FeatureCard 
              icon={RefreshCw}
              title="Granular Regeneration"
              description="Regenerate individual elements or whole scenes on demand — voiceover, images, or complete frame assets in one click."
            />
            <FeatureCard 
              icon={Video}
              title="Automated 9:16 Rendering"
              description="Powered by Remotion technology to produce crisp, publication-ready vertical video files instantly."
            />
          </div>
        </div>
      </section>

      {/* Workflow Steps Section */}
      <section id="workflow" className="py-24 border-b border-border">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">How It Works</Badge>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              From Prompt to Publication in 4 Steps
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Prompt & Tone", desc: "Enter your topic, set duration, choose your voice avatar, and define your target audience tone." },
              { step: "02", title: "AI Script & Storyboard", desc: "REAM generates structured scenes, script hooks, and visual prompts automatically." },
              { step: "03", title: "Multi-Asset Assembly", desc: "High-res images, voiceovers, and background music are automatically retrieved and aligned." },
              { step: "04", title: "Render & Publish", desc: "Preview in our studio editor, fine-tune any frame, and render your final 9:16 video reel." },
            ].map((s, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl border border-border bg-card/60">
                <span className="text-4xl font-heading font-black text-primary/30 mb-3 block">{s.step}</span>
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
         <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
         <div className="container relative mx-auto max-w-4xl px-4 text-center md:px-6">
            <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Ready to automate your video production?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Join content creators, agencies, and marketers scaling their social presence with REAM.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup">
                <Button variant="default" className="h-14 px-10 text-lg">
                  Start Creating Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="ghost" className="h-14 px-10 text-lg">
                  Sign In to Studio
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Instant access · No software installation required · 9:16 HD vertical video output
            </p>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-2 md:mb-4">
                <a href="/" className="w-18 md:w-24 h-16 md:h-20 flex items-center justify-center relative px-5">
                  <Image
                    src="/images/logo.png"
                    alt="REAM"
                    fill
                    className="object-contain w-full"
                    priority
                  />
                </a>
              </div>
              <p className="text-sm text-foreground/60">
                Automated short-form video creation platform powered by AI.
              </p>
            </div>
            
            {[
              { title: "Platform", links: ["Reel Editor", "AI Voices", "Music Engine"] },
              { title: "Features", links: ["Script Generation", "Scene Controls", "Video Rendering"] },
              { title: "Account", links: ["Sign In", "Get Started"] },
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-heading font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-border/50 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-foreground/60">
              © {new Date().getFullYear()} REAM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}