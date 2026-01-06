import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PoemCard } from "@/components/PoemCard";
import { ArrowLeft, BookOpen, Eye } from "lucide-react";
import { apiRequest, fetchStaticData } from "@/lib/queryClient";
import type { Prose, Poem } from "@shared/schema";

export default function ProseStory() {
  const [, params] = useRoute("/prose/:id");
  const proseId = params?.id;

  const { data: prose, isLoading } = useQuery<Prose>({
    queryKey: ["prose", proseId],
    queryFn: async () => {
      const allProse = await fetchStaticData<Prose[]>("/data/prose.json");
      const found = allProse.find((p) => p.id === proseId);
      if (!found) throw new Error("Story not found");
      return found;
    },
    enabled: !!proseId,
  });

  const { data: relatedPoem } = useQuery<Poem>({
    queryKey: ["poems", prose?.relatedPoemId],
    queryFn: async () => {
      const allPoems = await fetchStaticData<Poem[]>("/data/poems.json");
      return allPoems.find((p) => p.id === prose?.relatedPoemId) || null as any;
    },
    enabled: !!prose?.relatedPoemId,
  });

  // Track view
  const viewMutation = useMutation({
    mutationFn: async () => {
      if (proseId) {
        await apiRequest("POST", `/api/prose/${proseId}/view`, {});
      }
    },
  });

  useEffect(() => {
    if (proseId && !viewMutation.isPending) {
      viewMutation.mutate();
    }
  }, [proseId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading story...</p>
      </div>
    );
  }

  if (!prose) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Story not found</p>
          <Button onClick={() => window.location.href = "/prose"}>
            Back to Prose Collection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#1a1614] prose-story-page">
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

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-8 border-[1px] border-[#b8935f]/30 dark:border-[#b8935f]/30 hover:bg-[#a88860]/5 transition-all duration-300 text-[#a88860] dark:text-[#b8935f]"
          onClick={() => window.location.href = "/prose"}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Prose
        </Button>

        {/* Title and Metadata */}
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-[#1a1614] dark:text-white" data-testid="text-prose-title">
            {prose.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              <Badge className="bg-[#a88860] dark:bg-[#b8935f] text-white border-0">{prose.theme}</Badge>
              <Badge variant="outline" className="border-[#b8935f]/30 dark:border-[#b8935f]/30 text-[#a88860] dark:text-[#b8935f] border-[1px]">{prose.mood}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#a88860] dark:text-[#b8935f]">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {prose.readingTime} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {prose.views} views
              </span>
            </div>
          </div>
        </div>

        {/* Dual Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Philosophy Column */}
          <div className="space-y-6">
            <div className="sticky top-24">
              <div className="bg-transparent border-l-2 border-[#a88860] dark:border-[#b8935f] p-6">
                <h2 className="font-display text-2xl font-semibold mb-4 text-[#1a1614] dark:text-white">
                  The Philosophy
                </h2>
                <div 
                  className="prose prose-lg max-w-none leading-relaxed whitespace-pre-wrap text-[#3d3935] dark:text-[#e5e1dc]"
                  data-testid="text-philosophy-content"
                >
                  {prose.philosophyContent}
                </div>
              </div>
            </div>
          </div>

          {/* Narrative Column */}
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold mb-4 text-[#1a1614] dark:text-white">
                The Story
              </h2>
              <div 
                className="prose prose-lg max-w-none leading-relaxed whitespace-pre-wrap text-[#3d3935] dark:text-[#e5e1dc]"
                data-testid="text-narrative-content"
              >
                {prose.narrativeContent}
              </div>
            </div>
          </div>
        </div>

        {/* Related Poem */}
        {relatedPoem && (
          <div className="mt-16 pt-8 border-t border-[#b8935f]/10 dark:border-[#b8935f]/10">
            <h3 className="font-display text-2xl font-semibold mb-6 text-[#1a1614] dark:text-white">
              Related Poem
            </h3>
            <div className="max-w-md">
              <PoemCard 
                poem={relatedPoem}
                onClick={() => window.location.href = `/poetry`}
              />
            </div>
          </div>
        )}

        {/* Reflection Prompt */}
        <Card className="mt-16 p-8 bg-transparent border-[1px] border-[#b8935f]/20 dark:border-[#b8935f]/20">
          <h3 className="font-display text-xl font-semibold mb-3 text-[#1a1614] dark:text-white">
            Reflect on This
          </h3>
          <p className="text-[#3d3935] dark:text-[#e5e1dc] leading-relaxed">
            What resonated most with you in this piece? How does this philosophy 
            show up in your own life? Take a moment to contemplate before moving forward.
          </p>
        </Card>
      </div>
      <style>{`
        .prose-story-page a {
          transition: color 0.3s ease;
        }
        .prose-story-page a:hover {
          color: #a88860 !important;
        }
      `}</style>
    </div>
  );
}
