import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, BookOpen, Moon, Heart, Clock, Sprout, Sparkles, Zap, CloudRain, Star } from "lucide-react";
import type { Poem } from "@shared/schema";

interface PoemCardProps {
  poem: Poem;
  onClick?: () => void;
}

const themeIcons = {
  "Spiritual Depth": Moon,
  "Presence & Connection": Heart,
  "Time & Purpose": Clock,
  "Growth & Becoming": Sprout,
};

const moodIcons = {
  Reflective: Moon,
  Energetic: Zap,
  Melancholic: CloudRain,
  Inspiring: Sparkles,
};

export function PoemCard({ poem, onClick }: PoemCardProps) {
  const excerpt = poem.content.split('\n').slice(0, 2).join('\n');
  const ThemeIcon = themeIcons[poem.theme as keyof typeof themeIcons] || Moon;

  return (
    <Card 
      className="group p-6 hover-elevate active-elevate-2 cursor-pointer transition-all duration-600"
      onClick={onClick}
      data-testid={`card-poem-${poem.id}`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
          {poem.title}
        </h3>
        <div className="flex-shrink-0 text-primary/80">
          <ThemeIcon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="secondary" className="text-xs">
          {poem.theme}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {poem.mood}
        </Badge>
      </div>

      <p className="font-display text-muted-foreground leading-relaxed mb-4 line-clamp-2 italic">
        {excerpt}...
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {poem.readingTime} min
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {poem.views}
          </span>
        </div>
        <Button variant="ghost" size="sm" data-testid={`button-read-${poem.id}`}>
          Read
        </Button>
      </div>
    </Card>
  );
}
