import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PoemCard } from "@/components/PoemCard";
import { ImmersivePoemReader } from "@/components/ImmersivePoemReader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search, Moon, Heart, Clock, Sprout, type LucideIcon } from "lucide-react";
import { fetchStaticData } from "@/lib/queryClient";
import type { Poem } from "@shared/schema";

const THEMES: Array<{
  name: string;
  description: string;
  Icon: LucideIcon;
  gradient: string;
}> = [
  {
    name: "Spiritual Depth",
    description: "Poems exploring Allah, gratitude, transformation, and spiritual awakening",
    Icon: Moon,
    gradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
  },
  {
    name: "Presence & Connection",
    description: "On authentic relationships, listening, and being truly seen",
    Icon: Heart,
    gradient: "from-slate-50 to-blue-50 dark:from-slate-950/20 dark:to-blue-950/20",
  },
  {
    name: "Time & Purpose",
    description: "Wrestling with time, discipline, intentional living, and choosing your hard",
    Icon: Clock,
    gradient: "from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20",
  },
  {
    name: "Growth & Becoming",
    description: "The journey from wanting to becoming, transformation, evolution",
    Icon: Sprout,
    gradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
  }
];

export default function PoetryCollection() {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);

  const { data: poems = [], isLoading } = useQuery<Poem[]>({
    queryKey: ["poems"],
    queryFn: () => fetchStaticData("/data/poems.json"),
  });

  const isFilterActive = searchQuery.trim() !== "" || selectedTheme !== null;
  
  const publishedPoems = poems.filter((poem) => poem.status === "published");

  const matchingPoems = publishedPoems.filter((poem) => {
    const matchesTheme = !selectedTheme || poem.theme === selectedTheme;
    const matchesSearch = !searchQuery || 
      poem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poem.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTheme && matchesSearch;
  });

  const matchingPoemIds = new Set(matchingPoems.map((p) => p.id));

  const remainingPoems = publishedPoems.filter((poem) => !matchingPoemIds.has(poem.id));

  const groupedRemainingPoems = THEMES.map((theme) => ({
    ...theme,
    poems: remainingPoems.filter((p) => p.theme === theme.name)
  }));

  const groupedAllPoems = THEMES.map((theme) => ({
    ...theme,
    poems: publishedPoems.filter((p) => p.theme === theme.name)
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="font-display text-2xl font-bold hover:text-primary transition-colors">
            Same Moon Poetry
          </a>
          <nav className="flex items-center gap-6">
            <a href="/poetry" className="text-sm font-medium text-primary">
              Poetry
            </a>
            <a href="/prose" className="text-sm hover:text-primary transition-colors">
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
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Poetry Collection
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore poems by theme, mood, or spiritual direction
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search poems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-poems"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={!selectedTheme ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTheme(null)}
              data-testid="button-filter-all"
            >
              All Themes
            </Button>
            {THEMES.map((theme) => (
              <Button
                key={theme.name}
                variant={selectedTheme === theme.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTheme(theme.name)}
                data-testid={`button-filter-${theme.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <theme.Icon className="w-4 h-4 mr-1" />
                {theme.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Poem Sections */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading poems...</p>
          </div>
        ) : isFilterActive ? (
          <div className="space-y-24">
            {/* Matching Poems Section - Shown First When Filter Active */}
            {matchingPoems.length > 0 && (
              <section 
                className="rounded-xl p-8 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20"
                data-testid="section-matching-poems"
                style={{
                  animation: `fadeInUp 0.6s ease-out both`,
                }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-background/50">
                    <Search className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                      {searchQuery ? `Results for "${searchQuery}"` : `${selectedTheme}`}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      {matchingPoems.length} {matchingPoems.length === 1 ? 'poem' : 'poems'} found
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchingPoems.map((poem) => (
                    <PoemCard
                      key={poem.id}
                      poem={poem}
                      onClick={() => setSelectedPoem(poem)}
                    />
                  ))}
                </div>
              </section>
            )}

            {matchingPoems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No poems match your search. Try a different term or browse below.
                </p>
              </div>
            )}

            {/* Remaining Poems - Grouped by Theme */}
            {remainingPoems.length > 0 && (
              <>
                <div className="text-center">
                  <h3 className="font-display text-2xl font-semibold text-muted-foreground mb-2">
                    More Poems to Explore
                  </h3>
                  <p className="text-muted-foreground">
                    Browse other poems by theme
                  </p>
                </div>

                {groupedRemainingPoems.map((theme, index) => (
                  theme.poems.length > 0 && (
                    <section 
                      key={theme.name}
                      className={`rounded-xl p-8 bg-gradient-to-br ${theme.gradient}`}
                      data-testid={`section-theme-${theme.name.toLowerCase().replace(/\s+/g, '-')}`}
                      style={{
                        animation: `fadeInUp 0.6s ease-out ${(index + 1) * 0.1}s both`,
                      }}
                    >
                      <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 rounded-lg bg-background/50">
                          <theme.Icon className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                            {theme.name}
                          </h2>
                          <p className="text-lg text-muted-foreground">
                            {theme.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {theme.poems.map((poem) => (
                          <PoemCard
                            key={poem.id}
                            poem={poem}
                            onClick={() => setSelectedPoem(poem)}
                          />
                        ))}
                      </div>
                    </section>
                  )
                ))}
              </>
            )}
          </div>
        ) : (
          /* Default View - All Poems Grouped by Theme */
          <div className="space-y-24">
            {groupedAllPoems.map((theme, index) => (
              <section 
                key={theme.name}
                className={`rounded-xl p-8 bg-gradient-to-br ${theme.gradient}`}
                data-testid={`section-theme-${theme.name.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-background/50">
                    <theme.Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                      {theme.name}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      {theme.description}
                    </p>
                  </div>
                </div>

                {theme.poems.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {theme.poems.map((poem) => (
                      <PoemCard
                        key={poem.id}
                        poem={poem}
                        onClick={() => setSelectedPoem(poem)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No poems in this theme yet
                  </p>
                )}
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Immersive Reader */}
      {selectedPoem && (
        <ImmersivePoemReader
          poem={selectedPoem}
          onClose={() => setSelectedPoem(null)}
          relatedPoems={poems.filter(
            (p) => p.theme === selectedPoem.theme && p.id !== selectedPoem.id
          )}
        />
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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
