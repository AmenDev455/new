import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Bookmark, Type, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import type { Poem } from "@shared/schema";

interface ImmersivePoemReaderProps {
  poem: Poem;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  relatedPoems?: Poem[];
}

export function ImmersivePoemReader({ 
  poem, 
  onClose, 
  onPrevious, 
  onNext,
  relatedPoems = []
}: ImmersivePoemReaderProps) {
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(2);
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto"
      data-testid="modal-immersive-reader"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              data-testid="button-close-reader"
            >
              <X className="w-5 h-5" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {poem.readingTime} min read
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onPrevious && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onPrevious}
                data-testid="button-previous-poem"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            {onNext && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onNext}
                data-testid="button-next-poem"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          {/* Main Content */}
          <div className="order-2 lg:order-1">
            {/* Poem Metadata */}
            <div className="mb-8">
              <h1 
                className="font-display text-4xl md:text-5xl font-bold mb-4"
                data-testid="text-poem-title"
              >
                {poem.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{poem.theme}</Badge>
                <Badge variant="outline">{poem.mood}</Badge>
              </div>
            </div>

            {/* Poem Content */}
            <div 
              className="font-display whitespace-pre-wrap transition-all duration-300"
              style={{ 
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                maxWidth: '70ch'
              }}
              data-testid="text-poem-content"
            >
              {poem.content}
            </div>

            {/* Related Poems */}
            {relatedPoems.length > 0 && (
              <div className="mt-16 pt-8 border-t border-border">
                <h3 className="font-display text-2xl font-semibold mb-6">
                  Related Poems
                </h3>
                <div className="grid gap-4">
                  {relatedPoems.slice(0, 3).map((relatedPoem) => (
                    <Card 
                      key={relatedPoem.id} 
                      className="p-4 hover-elevate cursor-pointer"
                      data-testid={`card-related-${relatedPoem.id}`}
                    >
                      <h4 className="font-display text-lg font-semibold mb-2">
                        {relatedPoem.title}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relatedPoem.content.split('\n')[0]}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Controls */}
          <div className="order-1 lg:order-2">
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold mb-4">Reading Controls</h3>
              
              {/* Font Size */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Type className="w-4 h-4" />
                  <label className="text-sm font-medium">Font Size</label>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                    data-testid="button-font-decrease"
                  >
                    A-
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-12 text-center">
                    {fontSize}px
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                    data-testid="button-font-increase"
                  >
                    A+
                  </Button>
                </div>
              </div>

              {/* Line Height */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlignLeft className="w-4 h-4" />
                  <label className="text-sm font-medium">Line Height</label>
                </div>
                <div className="flex flex-col gap-2">
                  {[1.5, 1.75, 2].map((height) => (
                    <Button
                      key={height}
                      variant={lineHeight === height ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLineHeight(height)}
                      data-testid={`button-lineheight-${height}`}
                    >
                      {height === 1.5 ? "Compact" : height === 1.75 ? "Normal" : "Relaxed"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Theme Toggle */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Appearance</label>
                <ThemeToggle />
              </div>

              {/* Bookmark */}
              <Button
                variant={isBookmarked ? "default" : "outline"}
                className="w-full gap-2"
                onClick={() => setIsBookmarked(!isBookmarked)}
                data-testid="button-bookmark"
              >
                <Bookmark className="w-4 h-4" />
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
