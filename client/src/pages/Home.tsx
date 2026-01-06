import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MoonPhase } from "@/components/MoonPhase";
import { PoemCard } from "@/components/PoemCard";
import { ProseCard } from "@/components/ProseCard";
import { ImmersivePoemReader } from "@/components/ImmersivePoemReader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, fetchStaticData } from "@/lib/queryClient";
import { ArrowDown, Mail } from "lucide-react";
import type { Poem, Prose } from "@shared/schema";
import heroImage from "@assets/generated_images/Hero_silhouette_under_moon_dfa1e07c.png";

const FEATURED_QUOTES = [
  "At least we are watching the same moon",
  "Growth requires presence and discipline",
  "Time is the ultimate teacher",
  "We're all searching for authentic connection"
];

export default function Home() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentQuote, setCurrentQuote] = useState(0);
  const [email, setEmail] = useState("");
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);

  // Rotating quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % FEATURED_QUOTES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch featured poems (3-act structure)
  const { data: featuredPoems = [] } = useQuery<Poem[]>({
    queryKey: ["poems-featured"],
    queryFn: async () => {
      const allPoems = await fetchStaticData<Poem[]>("/data/poems.json");
      return allPoems.filter((p) => p.isFeatured > 0).sort((a, b) => a.isFeatured - b.isFeatured);
    },
  });

  // Fetch featured prose
  const { data: featuredProse = [] } = useQuery<Prose[]>({
    queryKey: ["prose-featured"],
    queryFn: async () => {
      const allProse = await fetchStaticData<Prose[]>("/data/prose.json");
      return allProse.filter((p) => p.isFeatured > 0);
    },
  });

  // Newsletter subscription
  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      await apiRequest("POST", "/api/newsletter", { email });
    },
    onSuccess: () => {
      toast({
        title: "Subscribed!",
        description: "You'll receive monthly reflections in your inbox.",
      });
      setEmail("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeMutation.mutate(email);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">
            Same Moon Poetry
          </h1>
          <nav className="flex items-center gap-6">
            <Link href="/poetry" className="text-sm hover:text-primary transition-colors">
              Poetry
            </Link>
            <Link href="/prose" className="text-sm hover:text-primary transition-colors">
              Prose
            </Link>
            <Link href="/about" className="text-sm hover:text-primary transition-colors">
              About
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-testid="section-hero"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <MoonPhase className="mb-8 mx-auto" />
          
          <h2 
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 transition-all duration-1000"
            key={currentQuote}
            data-testid="text-hero-quote"
          >
            {FEATURED_QUOTES[currentQuote]}
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 mb-4 font-display italic">
            Poetry and prose by Amen Allah Jebali
          </p>

          <div className="flex items-center justify-center gap-4 mt-12">
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
              data-testid="button-explore-poetry"
              onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Poetry
            </Button>
          </div>

          <div className="mt-16 animate-bounce">
            <ArrowDown className="w-6 h-6 text-white/70 mx-auto" />
          </div>
        </div>
      </section>

      {/* Featured Journey Section */}
      <section id="journey" className="py-24 bg-background" data-testid="section-journey">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Featured Poems
            </h2>
            <p className="text-xl text-muted-foreground">
              A journey through growth, presence, and becoming
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredPoems.slice(0, 3).map((poem, index) => (
              <div 
                key={poem.id}
                className="relative"
                style={{
                  animation: `slideIn 0.6s ease-out ${index * 0.2}s both`,
                }}
              >
                <div className="text-center mb-4">
                  <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {index === 0 ? "Searching" : index === 1 ? "Discovering" : "Becoming"}
                  </span>
                </div>
                <PoemCard 
                  poem={poem} 
                  onClick={() => setSelectedPoem(poem)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prose Stories Section */}
      <section className="py-24 bg-muted/30" data-testid="section-prose">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Reflections in Prose
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Observations that become stories. Lessons that become truth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {featuredProse.slice(0, 2).map((prose) => (
              <ProseCard 
                key={prose.id} 
                prose={prose}
                onClick={() => setLocation(`/prose/${prose.id}`)}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              data-testid="button-view-all-prose"
              onClick={() => setLocation('/prose')}
            >
              View All Prose
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-to-br from-primary/20 to-secondary/20" data-testid="section-newsletter">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Mail className="w-12 h-12 mx-auto mb-6 text-primary" />
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Receive Monthly Reflections
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            No spam. Just thoughtfully selected poetry and insights.
          </p>

          <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-newsletter-email"
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={subscribeMutation.isPending}
              data-testid="button-subscribe"
            >
              {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-display text-xl font-semibold mb-4">Same Moon Poetry</h3>
              <p className="text-sm text-muted-foreground">
                Exploring growth, presence, and connection through poetry and prose.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/poetry" className="text-muted-foreground hover:text-primary">Poetry Collection</Link></li>
                <li><Link href="/prose" className="text-muted-foreground hover:text-primary">Prose Reflections</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-primary">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <p className="text-sm text-muted-foreground">
                © 2024 Amen Allah Jebali
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Immersive Poem Reader Modal */}
      {selectedPoem && (
        <ImmersivePoemReader
          poem={selectedPoem}
          onClose={() => setSelectedPoem(null)}
        />
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
