import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { ProseCard } from "@/components/ProseCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search } from "lucide-react";
import { fetchStaticData } from "@/lib/queryClient";
import type { Prose } from "@shared/schema";

export default function ProseCollection() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: proseStories = [], isLoading } = useQuery<Prose[]>({
    queryKey: ["prose"],
    queryFn: () => fetchStaticData("/data/prose.json"),
  });

  const filteredProse = proseStories.filter((prose) => {
    const matchesSearch = !searchQuery || 
      prose.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prose.philosophyContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prose.narrativeContent.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && prose.status === "published";
  });

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#1a1614] prose-section">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="font-display text-2xl font-bold hover:text-primary transition-colors">
            Same Moon Poetry
          </a>
          <nav className="flex items-center gap-6">
            <a href="/poetry" className="text-sm hover:text-primary transition-colors">
              Poetry
            </a>
            <a href="/prose" className="text-sm font-medium text-primary">
              Prose
            </a>
            <a href="/about" className="text-sm hover:text-primary transition-colors">
              About
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-[#1a1614] dark:text-white">
            Reflections in Prose
          </h1>
          <p className="text-xl text-[#8b735c] dark:text-[#8b6f47] max-w-2xl mx-auto mb-8">
            Life lessons through stories and reflections
          </p>
          
          <div className="max-w-2xl mx-auto text-left p-6 rounded-lg mb-8 border-[1px] border-[#b8935f]/20 dark:border-[#b8935f]/20">
            <p className="text-[#3d3935] dark:text-[#e5e1dc] leading-relaxed">
              This section reflects the same themes I've explored in my poetry—but through a different lens. 
              Each piece pairs a philosophical observation with a personal narrative, showing how abstract 
              truths emerge from lived experience.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a88860] dark:text-[#b8935f]" />
            <Input
              type="search"
              placeholder="Search prose stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-transparent border-[#b8935f]/30 dark:border-[#b8935f]/30 text-[#3d3935] dark:text-[#e5e1dc] placeholder:text-[#a88860] dark:placeholder:text-[#b8935f]"
              data-testid="input-search-prose"
            />
          </div>
        </div>

        {/* Prose Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-[#a88860] dark:text-[#b8935f]">Loading stories...</p>
          </div>
        ) : filteredProse.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {filteredProse.map((prose) => (
              <ProseCard
                key={prose.id}
                prose={prose}
                onClick={() => window.location.href = `/prose/${prose.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#a88860] dark:text-[#b8935f]">
              {searchQuery ? "No stories found matching your search" : "No prose stories published yet"}
            </p>
          </div>
        )}
      </div>
      <style>{`
        .prose-section a {
          transition: color 0.3s ease;
        }
        .prose-section a:hover {
          color: #a88860 !important;
        }
      `}</style>
    </div>
  );
}
